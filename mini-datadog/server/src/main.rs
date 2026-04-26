use mini_datadog_server::{
    create_app, start_workers, AppState,
    db::init_db,
    auth::AuthState,
    models::{LogRecord, MetricRecord},
};
use std::sync::{Arc, Mutex};
use tokio::sync::{mpsc, broadcast};
use tracing::{info, warn};
use dashmap::DashMap;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let conn = init_db("mini_datadog.db").expect("Failed to initialize database");
    let db = Arc::new(Mutex::new(conn));

    let auth = Arc::new(AuthState {
        api_keys: DashMap::new(),
    });

    if let Ok(default_key) = std::env::var("DEFAULT_API_KEY") {
        auth.api_keys.insert(default_key, "default-service".to_string());
    } else {
        auth.api_keys.insert("minidog-test-key".to_string(), "test-service".to_string());
        warn!("No DEFAULT_API_KEY env var found. Using insecure test key.");
    }

    let buffer_size = std::env::var("BUFFER_SIZE")
        .unwrap_or_else(|_| "10000".to_string())
        .parse::<usize>()
        .unwrap_or(10000);

    let (log_tx, log_rx) = mpsc::channel::<LogRecord>(buffer_size);
    let (metric_tx, metric_rx) = mpsc::channel::<MetricRecord>(buffer_size);
    
    // ブロードキャスト・チャネルの初期化
    let (log_broadcast_tx, _) = broadcast::channel::<LogRecord>(buffer_size);

    start_workers(Arc::clone(&db), log_rx, metric_rx, log_broadcast_tx.clone());

    let state = Arc::new(AppState { 
        log_tx, 
        metric_tx, 
        log_broadcast_tx,
        db,
        auth: Arc::clone(&auth),
    });

    let app = create_app(state, auth);

    let addr = "0.0.0.0:3000";
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    info!("Mini Datadog Server listening on {}", addr);
    axum::serve(listener, app).await.unwrap();
}
