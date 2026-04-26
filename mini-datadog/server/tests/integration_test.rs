use axum::http::{HeaderName, HeaderValue, StatusCode};
use axum_test::TestServer;
use chrono::Utc;
use dashmap::DashMap;
use mini_datadog_server::{
    auth::AuthState,
    create_app,
    db::init_db,
    models::{LogQueryRequest, LogQueryResponse},
    start_workers, AppState,
};
use std::sync::{Arc, Mutex};
use tokio::sync::{broadcast, mpsc};

#[tokio::test]
async fn test_full_log_lifecycle() {
    // 1. セットアップ: 一時的なDBパスを作成
    let db_path = format!("test_{}.db", uuid::Uuid::new_v4());

    struct Cleanup(String);
    impl Drop for Cleanup {
        fn drop(&mut self) {
            let _ = std::fs::remove_file(&self.0);
        }
    }
    let _cleanup = Cleanup(db_path.clone());

    let conn = init_db(&db_path).expect("Failed to init test db");
    let db = Arc::new(Mutex::new(conn));

    let auth = Arc::new(AuthState {
        api_keys: DashMap::new(),
    });
    let test_key = "test-key-123";
    auth.api_keys
        .insert(test_key.to_string(), "test-service".to_string());

    let (log_tx, log_rx) = mpsc::channel(100);
    let (metric_tx, metric_rx) = mpsc::channel(100);
    let (log_broadcast_tx, _) = broadcast::channel(100);

    start_workers(Arc::clone(&db), log_rx, metric_rx, log_broadcast_tx.clone());

    let state = Arc::new(AppState {
        log_tx,
        metric_tx,
        log_broadcast_tx,
        db: Arc::clone(&db),
        auth: Arc::clone(&auth),
    });

    let app = create_app(state, auth);
    let server = TestServer::new(app).unwrap();

    // 2. 認証エラーのテスト
    let response = server
        .post("/api/v1/ingest/logs")
        .add_header(
            "X-API-Key".parse::<HeaderName>().unwrap(),
            "invalid-key".parse::<HeaderValue>().unwrap(),
        )
        .json(&vec![serde_json::json!({
            "timestamp": Utc::now(),
            "level": "info",
            "service": "test",
            "message": "unauthorized"
        })])
        .await;
    response.assert_status(StatusCode::UNAUTHORIZED);

    // 3. ログ受信のテスト
    let now = Utc::now();
    let log_msg = "Integration test log message";
    let response = server
        .post("/api/v1/ingest/logs")
        .add_header(
            "X-API-Key".parse::<HeaderName>().unwrap(),
            test_key.parse::<HeaderValue>().unwrap(),
        )
        .json(&serde_json::json!({
            "timestamp": now,
            "level": "info",
            "service": "test-service",
            "message": log_msg,
            "tags": {"env": "test"}
        }))
        .await;
    response.assert_status(StatusCode::ACCEPTED);

    // フラッシュを待機
    tokio::time::sleep(tokio::time::Duration::from_millis(1500)).await;

    // 4. クエリのテスト
    let query_req = LogQueryRequest {
        start: now - chrono::Duration::minutes(1),
        end: now + chrono::Duration::minutes(1),
        query: Some("Integration".to_string()),
        limit: Some(10),
        offset: Some(0),
    };

    let response = server
        .post("/api/v1/query/logs")
        .add_header(
            "X-API-Key".parse::<HeaderName>().unwrap(),
            test_key.parse::<HeaderValue>().unwrap(),
        )
        .json(&query_req)
        .await;

    response.assert_status(StatusCode::OK);
    let body: LogQueryResponse = response.json();
    assert!(!body.hits.is_empty());
    assert_eq!(body.hits[0].message, log_msg);
}
