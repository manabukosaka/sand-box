pub mod auth;
pub mod db;
pub mod error;
pub mod models;

use axum::{
    extract::State,
    http::{HeaderValue, StatusCode},
    middleware,
    response::{
        sse::{Event, Sse},
        IntoResponse,
    },
    routing::{get, post},
    Json, Router,
};
use futures::stream::{self, Stream};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::sync::mpsc;
use tower_http::cors::CorsLayer;
use tracing::{error, info, warn};

use crate::auth::{api_key_auth, AuthState};
use crate::error::AppError;
use crate::models::{
    LogQueryRequest, LogQueryResponse, LogRecord, MetricQueryRequest, MetricQueryResponse,
    MetricRecord, MetricValue,
};

pub fn start_cleanup_worker(db: Arc<Mutex<duckdb::Connection>>, retention_days: u64) {
    tokio::spawn(async move {
        loop {
            info!(
                "Starting scheduled data cleanup (retention: {} days)...",
                retention_days
            );
            if let Err(e) = run_cleanup_cycle(&db, retention_days).await {
                error!("Data cleanup cycle failed: {}", e);
            }
            info!("Cleanup cycle completed. Next run in 24 hours.");
            tokio::time::sleep(Duration::from_secs(24 * 60 * 60)).await;
        }
    });
}

pub async fn run_cleanup_cycle(
    db: &Arc<Mutex<duckdb::Connection>>,
    retention_days: u64,
) -> anyhow::Result<()> {
    let cutoff = chrono::Utc::now() - chrono::Duration::days(retention_days as i64);

    for table in &["logs", "metrics"] {
        loop {
            let current_oldest = {
                let conn = db.lock().map_err(|_| anyhow::anyhow!("Lock error"))?;
                crate::db::get_oldest_timestamp(&conn, table)?
            };

            if let Some(oldest) = current_oldest {
                if oldest >= cutoff {
                    break;
                }

                // 1日分進める（または最大でもcutoffまで）
                let next_target = (oldest + chrono::Duration::days(1)).min(cutoff);

                info!(
                    "Deleting data from {} between {} and {}",
                    table, oldest, next_target
                );

                {
                    let conn = db.lock().map_err(|_| anyhow::anyhow!("Lock error"))?;
                    crate::db::delete_data_range(&conn, table, oldest, next_target)?;
                }

                // インジェストへの割り込みを許可するために少し待つ
                tokio::time::sleep(Duration::from_millis(100)).await;
            } else {
                break;
            }
        }
    }

    // 最適化
    {
        let conn = db.lock().map_err(|_| anyhow::anyhow!("Lock error"))?;
        crate::db::checkpoint(&conn)?;
        info!("Database checkpoint completed.");
    }

    Ok(())
}

pub struct AppState {
    pub log_tx: mpsc::Sender<LogRecord>,
    pub metric_tx: mpsc::Sender<MetricRecord>,
    pub log_broadcast_tx: tokio::sync::broadcast::Sender<LogRecord>,
    pub db: Arc<Mutex<duckdb::Connection>>,
    pub auth: Arc<AuthState>,
}

#[derive(serde::Deserialize)]
#[serde(untagged)]
pub enum IngestPayload<T> {
    Single(T),
    Batch(Vec<T>),
}

pub fn create_app(state: Arc<AppState>, auth: Arc<AuthState>) -> Router {
    // 環境変数から CORS 許可ドメインを取得（デフォルトは localhost:3001）
    let default_origin = HeaderValue::from_static("http://localhost:3001");
    let allowed_origin = std::env::var("ALLOWED_ORIGIN")
        .ok()
        .and_then(|v| v.parse::<HeaderValue>().ok())
        .unwrap_or(default_origin);

    // 全ての API ルートを統合し、認証ミドルウェアを適用
    let api_v1 = Router::new()
        .nest(
            "/ingest",
            Router::new()
                .route("/logs", post(ingest_logs))
                .route("/metrics", post(ingest_metrics)),
        )
        .nest(
            "/query",
            Router::new()
                .route("/logs", post(query_logs))
                .route("/metrics", post(query_metrics)),
        )
        .route("/stream/logs", get(stream_logs))
        .layer(middleware::from_fn_with_state(
            Arc::clone(&auth),
            api_key_auth,
        ));

    Router::new()
        .nest("/api/v1", api_v1)
        .route("/health", get(|| async { "OK" }))
        .layer(
            CorsLayer::new()
                .allow_origin(allowed_origin)
                .allow_methods([axum::http::Method::GET, axum::http::Method::POST])
                .allow_headers([
                    axum::http::header::CONTENT_TYPE,
                    axum::http::header::HeaderName::from_static("x-api-key"),
                ]),
        )
        .with_state(state)
}

pub fn start_workers(
    db: Arc<Mutex<duckdb::Connection>>,
    mut log_rx: mpsc::Receiver<LogRecord>,
    mut metric_rx: mpsc::Receiver<MetricRecord>,
    log_broadcast_tx: tokio::sync::broadcast::Sender<LogRecord>,
) {
    let db_logs = Arc::clone(&db);
    tokio::spawn(async move {
        let mut buffer = Vec::with_capacity(1000);
        loop {
            tokio::select! {
                Some(record) = log_rx.recv() => {
                    let _ = log_broadcast_tx.send(record.clone());
                    buffer.push(record);
                    if buffer.len() >= 1000 {
                        flush_logs(&db_logs, &mut buffer).await;
                    }
                }
                _ = tokio::time::sleep(Duration::from_secs(1)) => {
                    if !buffer.is_empty() {
                        flush_logs(&db_logs, &mut buffer).await;
                    }
                }
            }
        }
    });

    let db_metrics = Arc::clone(&db);
    tokio::spawn(async move {
        let mut buffer = Vec::with_capacity(1000);
        loop {
            tokio::select! {
                Some(record) = metric_rx.recv() => {
                    buffer.push(record);
                    if buffer.len() >= 1000 {
                        flush_metrics(&db_metrics, &mut buffer).await;
                    }
                }
                _ = tokio::time::sleep(Duration::from_secs(1)) => {
                    if !buffer.is_empty() {
                        flush_metrics(&db_metrics, &mut buffer).await;
                    }
                }
            }
        }
    });
}

// --- Handlers ---

async fn stream_logs(
    State(state): State<Arc<AppState>>,
) -> Sse<impl Stream<Item = Result<Event, AppError>>> {
    let rx = state.log_broadcast_tx.subscribe();

    let stream = stream::unfold(rx, |mut rx| async move {
        match rx.recv().await {
            Ok(record) => {
                let event = match Event::default().json_data(record) {
                    Ok(e) => e,
                    Err(e) => return Some((Err(AppError::AxumError(e)), rx)),
                };
                Some((Ok(event), rx))
            }
            Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {
                warn!("Stream consumer lagged, skipping messages");
                Some((Ok(Event::default().comment("lagged")), rx))
            }
            Err(_) => None,
        }
    });

    Sse::new(stream).keep_alive(axum::response::sse::KeepAlive::default())
}

async fn ingest_logs(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<IngestPayload<LogRecord>>,
) -> impl IntoResponse {
    let records = match payload {
        IngestPayload::Single(r) => vec![r],
        IngestPayload::Batch(v) => v,
    };
    for record in records {
        if state.log_tx.try_send(record).is_err() {
            return StatusCode::TOO_MANY_REQUESTS;
        }
    }
    StatusCode::ACCEPTED
}

async fn ingest_metrics(
    State(state): State<Arc<AppState>>,
    Json(payload): Json<IngestPayload<MetricRecord>>,
) -> impl IntoResponse {
    let records = match payload {
        IngestPayload::Single(r) => vec![r],
        IngestPayload::Batch(v) => v,
    };
    for record in records {
        if state.metric_tx.try_send(record).is_err() {
            return StatusCode::TOO_MANY_REQUESTS;
        }
    }
    StatusCode::ACCEPTED
}

async fn query_logs(
    State(state): State<Arc<AppState>>,
    Json(req): Json<LogQueryRequest>,
) -> Result<impl IntoResponse, AppError> {
    let conn = state.db.lock().map_err(|_| AppError::LockError)?;
    let limit = req.limit.unwrap_or(100);
    let offset = req.offset.unwrap_or(0);

    let mut sql = "SELECT timestamp, received_at, level, service, message, tags, attributes 
                   FROM logs WHERE timestamp >= ? AND timestamp <= ?"
        .to_string();

    let level_filter = req.level.as_deref().unwrap_or("%");
    sql.push_str(" AND level LIKE ?");

    let query_pattern = req
        .query
        .as_ref()
        .map(|q| format!("%{}%", q))
        .unwrap_or_else(|| "%".to_string());
    sql.push_str(" AND (message LIKE ? OR service LIKE ?)");

    sql.push_str(" ORDER BY timestamp DESC LIMIT ? OFFSET ?");

    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query(duckdb::params![
        req.start,
        req.end,
        level_filter,
        query_pattern,
        query_pattern,
        limit,
        offset
    ])?;

    let hits: Vec<LogRecord> = rows.mapped(map_row_to_log).filter_map(|r| r.ok()).collect();

    let total = hits.len(); // In a real system, we would do a COUNT query for total

    Ok((StatusCode::OK, Json(LogQueryResponse { total, hits })))
}

fn map_row_to_log(row: &duckdb::Row) -> duckdb::Result<LogRecord> {
    let tags_str: Option<String> = row.get(5)?;
    let attrs_str: Option<String> = row.get(6)?;
    Ok(LogRecord {
        timestamp: row.get(0)?,
        received_at: row.get(1)?,
        level: row.get(2)?,
        service: row.get(3)?,
        message: row.get(4)?,
        tags: tags_str.and_then(|s| serde_json::from_str(&s).ok()),
        attributes: attrs_str.and_then(|s| serde_json::from_str(&s).ok()),
    })
}

async fn query_metrics(
    State(state): State<Arc<AppState>>,
    Json(req): Json<MetricQueryRequest>,
) -> Result<impl IntoResponse, AppError> {
    let conn = state.db.lock().map_err(|_| AppError::LockError)?;
    let interval = req.interval.unwrap_or_else(|| "1m".to_string());

    let sql = format!(
        "SELECT time_bucket(INTERVAL '{}', timestamp) as bucket, AVG(value) 
         FROM metrics 
         WHERE name = ? AND timestamp >= ? AND timestamp <= ?
         GROUP BY bucket ORDER BY bucket ASC",
        interval
    );

    let mut stmt = conn.prepare(&sql)?;
    let rows = stmt.query_map(
        duckdb::params![req.metric_name, req.start, req.end],
        |row| {
            Ok(MetricValue {
                timestamp: row.get(0)?,
                value: row.get(1)?,
            })
        },
    )?;

    let results: Vec<MetricValue> = rows.filter_map(|r| r.ok()).collect();

    Ok((
        StatusCode::OK,
        Json(MetricQueryResponse {
            metric_name: req.metric_name,
            results,
        }),
    ))
}

async fn flush_logs(db: &Arc<Mutex<duckdb::Connection>>, buffer: &mut Vec<LogRecord>) {
    let start = Instant::now();
    let conn = match db.lock() {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to acquire database lock for logs: {}", e);
            return;
        }
    };
    let mut appender = match conn.appender("logs") {
        Ok(a) => a,
        Err(e) => {
            error!("Failed to create logs appender: {}", e);
            return;
        }
    };

    let count = buffer.len();
    for record in buffer.drain(..) {
        let _ = appender.append_row(duckdb::params![
            record.timestamp,
            record.received_at,
            record.level,
            record.service,
            record.message,
            record.tags.map(|v| v.to_string()),
            record.attributes.map(|v| v.to_string()),
        ]);
    }
    if let Err(e) = appender.flush() {
        error!("Failed to flush logs to database: {}", e);
    } else {
        info!("Flushed {} logs in {:?}", count, start.elapsed());
    }
}

async fn flush_metrics(db: &Arc<Mutex<duckdb::Connection>>, buffer: &mut Vec<MetricRecord>) {
    let start = Instant::now();
    let conn = match db.lock() {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to acquire database lock for metrics: {}", e);
            return;
        }
    };
    let mut appender = match conn.appender("metrics") {
        Ok(a) => a,
        Err(e) => {
            error!("Failed to create metrics appender: {}", e);
            return;
        }
    };

    let count = buffer.len();
    for record in buffer.drain(..) {
        let _ = appender.append_row(duckdb::params![
            record.timestamp,
            record.name,
            record.value,
            record.service,
            record.tags.map(|v| v.to_string()),
        ]);
    }
    if let Err(e) = appender.flush() {
        error!("Failed to flush metrics to database: {}", e);
    } else {
        info!("Flushed {} metrics in {:?}", count, start.elapsed());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::LogRecord;
    use chrono::Utc;
    use serde_json::json;

    #[test]
    fn test_ingest_payload_deserialization() {
        let single_json = json!({
            "timestamp": "2023-01-01T00:00:00Z",
            "level": "info",
            "service": "test",
            "message": "hello"
        });
        let payload: IngestPayload<LogRecord> = serde_json::from_value(single_json).unwrap();
        match payload {
            IngestPayload::Single(_) => (),
            _ => panic!("Expected Single"),
        }

        let batch_json = json!([
            {
                "timestamp": "2023-01-01T00:00:00Z",
                "level": "info",
                "service": "test",
                "message": "hello 1"
            },
            {
                "timestamp": "2023-01-01T00:00:01Z",
                "level": "info",
                "service": "test",
                "message": "hello 2"
            }
        ]);
        let payload: IngestPayload<LogRecord> = serde_json::from_value(batch_json).unwrap();
        match payload {
            IngestPayload::Batch(v) => assert_eq!(v.len(), 2),
            _ => panic!("Expected Batch"),
        }
    }

    #[test]
    fn test_ingest_payload_empty_batch() {
        let batch_json = json!([]);
        let payload: IngestPayload<LogRecord> = serde_json::from_value(batch_json).unwrap();
        match payload {
            IngestPayload::Batch(v) => assert_eq!(v.len(), 0),
            _ => panic!("Expected Batch"),
        }
    }

    #[test]
    fn test_map_row_to_log_malformed_json() {
        let conn = duckdb::Connection::open_in_memory().unwrap();
        // Use VARCHAR instead of JSON to bypass DuckDB's native validation for this test.
        conn.execute("CREATE TABLE logs (timestamp TIMESTAMP, received_at TIMESTAMP, level VARCHAR, service VARCHAR, message TEXT, tags VARCHAR, attributes VARCHAR)", []).unwrap();

        // This is not valid JSON
        conn.execute("INSERT INTO logs VALUES ('2023-01-01 00:00:00', '2023-01-01 00:00:00', 'info', 'test', 'msg', '{bad json}', '{{ more bad json }}')", []).unwrap();

        let mut stmt = conn.prepare("SELECT * FROM logs").unwrap();
        let mut rows = stmt.query([]).unwrap();
        let row = rows.next().unwrap().unwrap();

        let log = map_row_to_log(row).unwrap();
        assert_eq!(log.message, "msg");
        assert!(log.tags.is_none()); // Failed parsing returns None
        assert!(log.attributes.is_none());
    }

    #[tokio::test]
    async fn test_query_logs_no_hits() {
        let conn = crate::db::init_db(":memory:").unwrap();
        let db = Arc::new(Mutex::new(conn));
        let (tx, _) = mpsc::channel(1);
        let (mtx, _) = mpsc::channel(1);
        let (btx, _) = tokio::sync::broadcast::channel(1);
        let auth = Arc::new(AuthState {
            api_keys: dashmap::DashMap::new(),
        });
        let state = Arc::new(AppState {
            log_tx: tx,
            metric_tx: mtx,
            log_broadcast_tx: btx,
            db,
            auth,
        });

        let req = LogQueryRequest {
            start: Utc::now() - chrono::Duration::hours(1),
            end: Utc::now(),
            level: None,
            query: None,
            limit: Some(10),
            offset: Some(0),
        };

        // This is a direct handler call test
        let response = query_logs(State(state), Json(req)).await.unwrap();
        // Since we can't easily inspect axum::response::Response without extra traits,
        // we'll just check it doesn't error.
        // In a real scenario, we'd use TestServer as in integration_test.rs.
    }
}
