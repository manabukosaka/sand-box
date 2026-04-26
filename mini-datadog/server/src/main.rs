use axum::{
    extract::{State, Query},
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use duckdb::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tracing::{info, error};

#[derive(Debug, Serialize, Deserialize, Clone)]
struct LogRecord {
    timestamp: DateTime<Utc>,
    level: String,
    service: String,
    message: String,
    #[serde(default)]
    tags: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct LogQuery {
    service: Option<String>,
    limit: Option<usize>,
}

struct AppState {
    db: Arc<Mutex<Connection>>,
    tx: mpsc::Sender<LogRecord>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let conn = Connection::open("mini_datadog.db").expect("failed to open database");
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            timestamp TIMESTAMP,
            level TEXT,
            service TEXT,
            message TEXT,
            tags JSON
        )",
        [],
    ).expect("failed to create table");

    let db = Arc::new(Mutex::new(conn));
    let (tx, mut rx) = mpsc::channel::<LogRecord>(10000);

    let db_clone = Arc::clone(&db);
    tokio::spawn(async move {
        let mut buffer = Vec::with_capacity(1000);
        loop {
            let timeout = tokio::time::sleep(tokio::time::Duration::from_secs(1));
            tokio::select! {
                Some(record) = rx.recv() => {
                    buffer.push(record);
                    if buffer.len() >= 1000 {
                        flush_buffer(&db_clone, &mut buffer).await;
                    }
                }
                _ = timeout => {
                    if !buffer.is_empty() {
                        flush_buffer(&db_clone, &mut buffer).await;
                    }
                }
            }
        }
    });

    let state = Arc::new(AppState { db, tx });

    let app = Router::new()
        .route("/api/v1/ingest/logs", post(ingest_logs))
        .route("/api/v1/query/logs", get(query_logs))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    info!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn flush_buffer(db: &Arc<Mutex<Connection>>, buffer: &mut Vec<LogRecord>) {
    let conn = db.lock().unwrap();
    let mut appender = conn.appender("logs").expect("failed to create appender");
    
    for record in buffer.drain(..) {
        if let Err(e) = appender.append_row(params![
            record.timestamp,
            record.level,
            record.service,
            record.message,
            record.tags.to_string(),
        ]) {
            error!("Failed to append row: {}", e);
        }
    }
    drop(appender);
    info!("Flushed logs to DuckDB");
}

async fn ingest_logs(
    State(state): State<Arc<AppState>>,
    Json(records): Json<Vec<LogRecord>>,
) -> StatusCode {
    for record in records {
        if let Err(_) = state.tx.send(record).await {
            error!("Failed to send log to channel");
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    }
    StatusCode::ACCEPTED
}

async fn query_logs(
    State(state): State<Arc<AppState>>,
    Query(params): Query<LogQuery>,
) -> (StatusCode, Json<Vec<LogRecord>>) {
    let conn = state.db.lock().unwrap();
    let limit = params.limit.unwrap_or(100);
    
    let mut results = Vec::new();
    
    let query_res = if let Some(service) = &params.service {
        let mut stmt = conn.prepare("SELECT timestamp, level, service, message, tags FROM logs WHERE service = ? ORDER BY timestamp DESC LIMIT ?").unwrap();
        let rows = stmt.query_map(params![service, limit], |row| {
            let tags_str: String = row.get(4)?;
            Ok(LogRecord {
                timestamp: row.get(0)?,
                level: row.get(1)?,
                service: row.get(2)?,
                message: row.get(3)?,
                tags: serde_json::from_str(&tags_str).unwrap_or(serde_json::Value::Null),
            })
        });
        match rows {
            Ok(mapped_rows) => {
                for row in mapped_rows {
                    if let Ok(record) = row {
                        results.push(record);
                    }
                }
                Ok(())
            }
            Err(e) => Err(e),
        }
    } else {
        let mut stmt = conn.prepare("SELECT timestamp, level, service, message, tags FROM logs ORDER BY timestamp DESC LIMIT ?").unwrap();
        let rows = stmt.query_map(params![limit], |row| {
            let tags_str: String = row.get(4)?;
            Ok(LogRecord {
                timestamp: row.get(0)?,
                level: row.get(1)?,
                service: row.get(2)?,
                message: row.get(3)?,
                tags: serde_json::from_str(&tags_str).unwrap_or(serde_json::Value::Null),
            })
        });
        match rows {
            Ok(mapped_rows) => {
                for row in mapped_rows {
                    if let Ok(record) = row {
                        results.push(record);
                    }
                }
                Ok(())
            }
            Err(e) => Err(e),
        }
    };

    match query_res {
        Ok(_) => (StatusCode::OK, Json(results)),
        Err(e) => {
            error!("Query failed: {}", e);
            (StatusCode::INTERNAL_SERVER_ERROR, Json(vec![]))
        }
    }
}
