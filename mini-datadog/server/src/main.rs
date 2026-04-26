use dashmap::DashMap;
use mini_datadog_server::{
    auth::AuthState,
    create_app,
    db::init_db,
    models::{LogRecord, MetricRecord},
    start_workers, AppState,
};
use std::sync::{Arc, Mutex};
use tokio::sync::{broadcast, mpsc};
use tracing::{info, warn};

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let conn = init_db("mini_datadog.db")?;
    let db = Arc::new(Mutex::new(conn));

    let auth = Arc::new(AuthState {
        api_keys: DashMap::new(),
    });

    if let Ok(default_key) = std::env::var("DEFAULT_API_KEY") {
        auth.api_keys
            .insert(default_key, "default-service".to_string());
    } else {
        auth.api_keys
            .insert("minidog-test-key".to_string(), "test-service".to_string());
        warn!("No DEFAULT_API_KEY env var found. Using insecure test key.");
    }

    let buffer_size = std::env::var("BUFFER_SIZE")
        .ok()
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(10000);

    let (log_tx, log_rx) = mpsc::channel::<LogRecord>(buffer_size);
    let (metric_tx, metric_rx) = mpsc::channel::<MetricRecord>(buffer_size);

    // ブロードキャスト・チャネルの初期化
    let (log_broadcast_tx, _) = broadcast::channel::<LogRecord>(buffer_size);

    start_workers(Arc::clone(&db), log_rx, metric_rx, log_broadcast_tx.clone());

    // データクリーンアップジョブの開始
    let retention_days = std::env::var("DATA_RETENTION_DAYS")
        .ok()
        .and_then(|v| v.parse::<u64>().ok())
        .unwrap_or(30);
    mini_datadog_server::start_cleanup_worker(Arc::clone(&db), retention_days);

    let state = Arc::new(AppState {
        log_tx,
        metric_tx,
        log_broadcast_tx,
        db,
        auth: Arc::clone(&auth),
    });

    let app = create_app(state, auth);

    let port = std::env::var("PORT")
        .ok()
        .and_then(|v| v.parse::<u16>().ok())
        .unwrap_or(3000);
    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    let listener = tokio::net::TcpListener::bind(addr).await?;
    info!("Mini Datadog Server listening on {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
