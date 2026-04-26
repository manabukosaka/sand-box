pub mod auth;
pub mod db;
pub mod models;

use axum::{
    extract::State,
    http::{HeaderValue, StatusCode},
    middleware,
    response::sse::{Event, Sse},
    routing::{get, post},
    Json, Router,
};
use futures::stream::{self, Stream};
use std::convert::Infallible;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::sync::mpsc;
use tower_http::cors::CorsLayer;
use tracing::{error, info, warn};

use crate::auth::{api_key_auth, AuthState};
use crate::models::{
    LogQueryRequest, LogQueryResponse, LogRecord, MetricQueryRequest, MetricQueryResponse,
    MetricRecord, MetricValue,
};

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
    let allowed_origin = std::env::var("ALLOWED_ORIGIN")
        .unwrap_or_else(|_| "http://localhost:3001".to_string())
        .parse::<HeaderValue>()
        .unwrap_or(HeaderValue::from_static("http://localhost:3001"));

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
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let rx = state.log_broadcast_tx.subscribe();

    let stream = stream::unfold(rx, |mut rx| async move {
        match rx.recv().await {
            Ok(record) => {
                let event = Event::default().json_data(record).unwrap();
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
) -> StatusCode {
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
) -> StatusCode {
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
) -> (StatusCode, Json<LogQueryResponse>) {
    let conn = state.db.lock().unwrap();
    let limit = req.limit.unwrap_or(100);
    let offset = req.offset.unwrap_or(0);

    let mut sql = "SELECT timestamp, received_at, level, service, message, tags, attributes 
                   FROM logs WHERE timestamp >= ? AND timestamp <= ?"
        .to_string();

    let hits: Vec<LogRecord> = if let Some(ref q) = req.query {
        sql.push_str(" AND (message LIKE ? OR service LIKE ?)");
        sql.push_str(" ORDER BY timestamp DESC LIMIT ? OFFSET ?");
        let search_pattern = format!("%{}%", q);
        let mut stmt = conn.prepare(&sql).unwrap();
        let rows = stmt
            .query_map(
                duckdb::params![
                    req.start,
                    req.end,
                    search_pattern,
                    search_pattern,
                    limit,
                    offset
                ],
                map_row_to_log,
            )
            .unwrap();
        rows.filter_map(|r| r.ok()).collect()
    } else {
        sql.push_str(" ORDER BY timestamp DESC LIMIT ? OFFSET ?");
        let mut stmt = conn.prepare(&sql).unwrap();
        let rows = stmt
            .query_map(
                duckdb::params![req.start, req.end, limit, offset],
                map_row_to_log,
            )
            .unwrap();
        rows.filter_map(|r| r.ok()).collect()
    };

    let total = hits.len();

    (StatusCode::OK, Json(LogQueryResponse { total, hits }))
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
) -> (StatusCode, Json<MetricQueryResponse>) {
    let conn = state.db.lock().unwrap();
    let interval = req.interval.unwrap_or_else(|| "1m".to_string());

    let sql = format!(
        "SELECT time_bucket(INTERVAL '{}', timestamp) as bucket, AVG(value) 
         FROM metrics 
         WHERE name = ? AND timestamp >= ? AND timestamp <= ?
         GROUP BY bucket ORDER BY bucket ASC",
        interval
    );

    let mut stmt = conn.prepare(&sql).unwrap();
    let rows = stmt
        .query_map(
            duckdb::params![req.metric_name, req.start, req.end],
            |row| {
                Ok(MetricValue {
                    timestamp: row.get(0)?,
                    value: row.get(1)?,
                })
            },
        )
        .unwrap();

    let results: Vec<MetricValue> = rows.filter_map(|r| r.ok()).collect();

    (
        StatusCode::OK,
        Json(MetricQueryResponse {
            metric_name: req.metric_name,
            results,
        }),
    )
}

async fn flush_logs(db: &Arc<Mutex<duckdb::Connection>>, buffer: &mut Vec<LogRecord>) {
    let start = Instant::now();
    let conn = db.lock().unwrap();
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
    let _ = appender.flush();
    info!("Flushed {} logs in {:?}", count, start.elapsed());
}

async fn flush_metrics(db: &Arc<Mutex<duckdb::Connection>>, buffer: &mut Vec<MetricRecord>) {
    let start = Instant::now();
    let conn = db.lock().unwrap();
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
    let _ = appender.flush();
    info!("Flushed {} metrics in {:?}", count, start.elapsed());
}
