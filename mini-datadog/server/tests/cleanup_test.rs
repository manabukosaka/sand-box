use chrono::{Duration as ChronoDuration, Utc};
use mini_datadog_server::db::{get_oldest_timestamp, init_db};
use mini_datadog_server::{models::LogRecord, run_cleanup_cycle};
use std::fs;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::mpsc;

#[tokio::test]
async fn test_data_cleanup_accuracy() {
    let db_path = "test_cleanup_accuracy.db";
    let _ = fs::remove_file(db_path);

    let conn = init_db(db_path).expect("Failed to init db");
    let db = Arc::new(Mutex::new(conn));

    let now = Utc::now();
    let thirty_one_days_ago = now - ChronoDuration::days(31);
    let twenty_nine_days_ago = now - ChronoDuration::days(29);

    // データの注入
    {
        let conn = db.lock().unwrap();
        conn.execute(
            "INSERT INTO logs (timestamp, message, level, service) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)",
            duckdb::params![
                thirty_one_days_ago, "oldest", "info", "test",
                twenty_nine_days_ago, "middle", "info", "test",
                now, "newest", "info", "test"
            ],
        ).unwrap();
    }

    // 30日保持設定でクリーンアップ実行
    run_cleanup_cycle(&db, 30).await.expect("Cleanup failed");

    // 結果検証
    {
        let conn = db.lock().unwrap();
        let oldest = get_oldest_timestamp(&conn, "logs").unwrap().unwrap();

        // 31日前のデータが消えているので、最古は29日前のはず
        assert!(oldest > thirty_one_days_ago + ChronoDuration::hours(1));
        assert!(oldest <= twenty_nine_days_ago);

        let mut stmt = conn.prepare("SELECT count(*) FROM logs").unwrap();
        let count: i64 = stmt.query_row([], |r| r.get(0)).unwrap();
        assert_eq!(count, 2, "Should have 2 records remaining");
    }

    let _ = fs::remove_file(db_path);
}

#[tokio::test]
async fn test_cleanup_concurrency() {
    let db_path = "test_cleanup_concurrency.db";
    let _ = fs::remove_file(db_path);

    let conn = init_db(db_path).expect("Failed to init db");
    let db = Arc::new(Mutex::new(conn));

    // 1. 大量の古いデータを準備 (1万件)
    let old_base = Utc::now() - ChronoDuration::days(40);
    {
        let conn = db.lock().unwrap();
        let mut appender = conn.appender("logs").unwrap();
        for i in 0..10000 {
            appender
                .append_row(duckdb::params![
                    old_base + ChronoDuration::milliseconds(i),
                    Utc::now(),
                    "info",
                    "bench",
                    "old message",
                    None::<String>,
                    None::<String>
                ])
                .unwrap();
        }
    }

    // 2. クリーンアップを非同期で開始
    let db_clone = Arc::clone(&db);
    let cleanup_handle = tokio::spawn(async move { run_cleanup_cycle(&db_clone, 30).await });

    // 3. 高頻度インジェストをシミュレート
    let (log_tx, mut log_rx) = mpsc::channel::<LogRecord>(1000);

    let db_worker = Arc::clone(&db);
    let worker_handle = tokio::spawn(async move {
        let mut buffer = Vec::with_capacity(100);
        for _ in 0..50 {
            // 50回バッチ処理 (合計5000件)
            for _ in 0..100 {
                if let Some(record) = log_rx.recv().await {
                    buffer.push(record);
                }
            }
            {
                let conn = db_worker.lock().unwrap();
                let mut appender = conn.appender("logs").unwrap();
                for r in buffer.drain(..) {
                    appender
                        .append_row(duckdb::params![
                            r.timestamp,
                            r.received_at,
                            r.level,
                            r.service,
                            r.message,
                            None::<String>,
                            None::<String>
                        ])
                        .unwrap();
                }
                appender.flush().unwrap();
            }
            tokio::time::sleep(Duration::from_millis(10)).await;
        }
    });

    // インジェスト実行
    for i in 0..5000 {
        let record = LogRecord {
            timestamp: Utc::now(),
            received_at: Utc::now(),
            level: "info".to_string(),
            service: "ingest".to_string(),
            message: format!("new message {}", i),
            tags: None,
            attributes: None,
        };
        log_tx.send(record).await.unwrap();
    }

    // 両方の完了を待つ
    cleanup_handle.await.unwrap().expect("Cleanup failed");
    worker_handle.await.unwrap();

    // 4. 整合性確認
    {
        let conn = db.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT count(*) FROM logs WHERE service = 'ingest'")
            .unwrap();
        let count: i64 = stmt.query_row([], |r| r.get(0)).unwrap();
        assert_eq!(count, 5000, "All new ingested logs should be present");

        let mut stmt = conn
            .prepare("SELECT count(*) FROM logs WHERE service = 'bench'")
            .unwrap();
        let count_old: i64 = stmt.query_row([], |r| r.get(0)).unwrap();
        assert_eq!(count_old, 0, "All old logs should be deleted");
    }

    let _ = fs::remove_file(db_path);
}

#[tokio::test]
async fn test_resource_management_checkpoint() {
    let db_path = "test_resource.db";
    let _ = fs::remove_file(db_path);

    let conn = init_db(db_path).expect("Failed to init db");
    let db = Arc::new(Mutex::new(conn));

    // 1. 大量データ挿入 (件数を増やしてサイズを安定させる)
    {
        let conn = db.lock().unwrap();
        let mut appender = conn.appender("logs").unwrap();
        for _ in 0..100000 {
            appender.append_row(duckdb::params![
                Utc::now() - ChronoDuration::days(40),
                Utc::now(),
                "info",
                "bloat",
                "some long message to take up space. some long message to take up space. some long message to take up space.",
                None::<String>,
                None::<String>
            ]).unwrap();
        }
        appender.flush().unwrap();
    }

    // CHECKPOINTを強制して、初期サイズを確定させる
    {
        let conn = db.lock().unwrap();
        conn.execute("CHECKPOINT", []).unwrap();
    }

    let size_initial = fs::metadata(db_path).unwrap().len();
    println!(
        "Initial size (after 100k insert + checkpoint): {} bytes",
        size_initial
    );

    // 2. クリーンアップ実行 (これに CHECKPOINT が含まれている)
    run_cleanup_cycle(&db, 30).await.expect("Cleanup failed");

    let size_after_cleanup = fs::metadata(db_path).unwrap().len();
    println!(
        "Size after cleanup/checkpoint: {} bytes",
        size_after_cleanup
    );

    // 3. 追加の検証: 空き領域がある状態で再度データを追加してもファイルサイズが爆発的に増えないこと
    {
        let conn = db.lock().unwrap();
        let mut appender = conn.appender("logs").unwrap();
        for _ in 0..20000 {
            appender
                .append_row(duckdb::params![
                    Utc::now(),
                    Utc::now(),
                    "info",
                    "new",
                    "message",
                    None::<String>,
                    None::<String>
                ])
                .unwrap();
        }
        appender.flush().unwrap();
        conn.execute("CHECKPOINT", []).unwrap();
    }

    let size_after_refill = fs::metadata(db_path).unwrap().len();
    println!(
        "Size after refill + checkpoint: {} bytes",
        size_after_refill
    );

    // 削除した10万件の空き領域に2万件が収まるはずなので、
    // ファイルサイズは初期サイズ（10万件保持時）を超えないはず。
    assert!(
        size_after_refill <= size_initial * 11 / 10,
        "File size should be maintained within reasonable limits by reuse"
    );

    let _ = fs::remove_file(db_path);
}
