use axum::http::{HeaderName, HeaderValue, StatusCode};
use axum_test::TestServer;
use chrono::Utc;
use dashmap::DashMap;
use mini_datadog_server::{
    auth::AuthState, create_app, db::init_db, models::LogRecord, start_workers, AppState,
};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::sync::{broadcast, mpsc};

#[tokio::test]
async fn test_performance_and_stability() {
    // 1. Setup
    let db_path = "perf_test.db";
    let _ = std::fs::remove_file(db_path);
    let conn = init_db(db_path).expect("Failed to init test db");
    let db = Arc::new(Mutex::new(conn));

    let auth = Arc::new(AuthState {
        api_keys: DashMap::new(),
    });
    let test_key = "perf-key";
    auth.api_keys
        .insert(test_key.to_string(), "perf-service".to_string());

    // Channel capacity to handle high load
    let (log_tx, log_rx) = mpsc::channel(10000);
    let (metric_tx, metric_rx) = mpsc::channel(10000);
    let (log_broadcast_tx, _) = broadcast::channel(10000);

    start_workers(Arc::clone(&db), log_rx, metric_rx, log_broadcast_tx.clone());

    let state = Arc::new(AppState {
        log_tx,
        metric_tx,
        log_broadcast_tx: log_broadcast_tx.clone(),
        db: Arc::clone(&db),
        auth: Arc::clone(&auth),
    });

    let app = create_app(state, auth);
    let server = TestServer::new(app).unwrap();

    // 2. SSE Stability (Background consumers)
    let mut sse_handles = vec![];
    for _ in 0..10 {
        let mut rx = log_broadcast_tx.subscribe();
        let handle = tokio::spawn(async move {
            let mut count = 0;
            let mut lagged = 0;
            while let Ok(msg_res) = tokio::time::timeout(Duration::from_secs(15), rx.recv()).await {
                match msg_res {
                    Ok(_) => count += 1,
                    Err(broadcast::error::RecvError::Lagged(_)) => lagged += 1,
                    Err(_) => break,
                }
            }
            (count, lagged)
        });
        sse_handles.push(handle);
    }

    // 3. Load Test: 5,000 logs/sec
    // We send 50 batches of 1,000 logs each, with 200ms interval = 10 seconds total.
    let total_logs = 50000;
    let batch_size = 1000;
    let num_batches = total_logs / batch_size;

    println!(
        "Starting load test: {} logs, {} logs/sec target",
        total_logs, 5000
    );
    let start_time = Instant::now();
    let mut latencies = vec![];

    for i in 0..num_batches {
        let mut batch = Vec::with_capacity(batch_size);
        for j in 0..batch_size {
            batch.push(LogRecord {
                timestamp: Utc::now(),
                received_at: Utc::now(),
                level: "info".to_string(),
                service: "perf-service".to_string(),
                message: format!("Perf log message {} - {}", i, j),
                tags: None,
                attributes: None,
            });
        }

        let batch_start = Instant::now();
        let response = server
            .post("/api/v1/ingest/logs")
            .add_header(
                HeaderName::from_static("x-api-key"),
                HeaderValue::from_str(test_key).unwrap(),
            )
            .json(&batch)
            .await;
        latencies.push(batch_start.elapsed());

        response.assert_status(StatusCode::ACCEPTED);

        // Control throughput to roughly 5000/sec
        let elapsed_so_far = start_time.elapsed();
        let expected_time = Duration::from_millis((i as u64 + 1) * 200);
        if elapsed_so_far < expected_time {
            tokio::time::sleep(expected_time - elapsed_so_far).await;
        }
    }

    let duration = start_time.elapsed();
    let throughput = total_logs as f64 / duration.as_secs_f64();

    println!("Load test completed in {:?}", duration);
    println!("Actual Throughput: {:.2} logs/sec", throughput);

    // 4. Wait for database flush
    println!("Waiting for DB flush...");
    tokio::time::sleep(Duration::from_secs(5)).await;

    let conn_check = db.lock().expect("Lock failed");
    let mut stmt = conn_check
        .prepare("SELECT count(*) FROM logs")
        .expect("Prepare failed");
    let count: i64 = stmt.query_row([], |row| row.get(0)).expect("Query failed");

    println!("Logs successfully persisted in DB: {}", count);

    // p99 latency calculation
    latencies.sort();
    let p99 = latencies[(latencies.len() as f64 * 0.99) as usize];
    let p50 = latencies[(latencies.len() as f64 * 0.50) as usize];
    println!("Batch Ingest Latency: p50={:?}, p99={:?}", p50, p99);

    // Verify SSE consumers
    for (i, h) in sse_handles.into_iter().enumerate() {
        let (count, lagged) = h.await.unwrap();
        println!("SSE Consumer {}: received={}, lagged={}", i, count, lagged);
    }

    // Clean up
    drop(conn_check);
    let _ = std::fs::remove_file(db_path);

    assert!(
        count >= total_logs as i64,
        "Data loss detected: expected {}, got {}",
        total_logs,
        count
    );
}
