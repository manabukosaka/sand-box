use duckdb::{Connection, Result};
use std::path::Path;

pub fn init_db<P: AsRef<Path>>(path: P) -> Result<Connection> {
    let conn = Connection::open(path)?;

    // ログテーブルの作成
    conn.execute(
        "CREATE TABLE IF NOT EXISTS logs (
            timestamp TIMESTAMP,
            received_at TIMESTAMP,
            level VARCHAR,
            service VARCHAR,
            message TEXT,
            tags JSON,
            attributes JSON
        )",
        [],
    )?;

    // メトリクステーブルの作成
    conn.execute(
        "CREATE TABLE IF NOT EXISTS metrics (
            timestamp TIMESTAMP,
            name VARCHAR,
            value DOUBLE,
            service VARCHAR,
            tags JSON
        )",
        [],
    )?;

    // APIキー管理テーブルの作成
    conn.execute(
        "CREATE TABLE IF NOT EXISTS api_keys (
            key_hash VARCHAR PRIMARY KEY,
            service_name VARCHAR,
            created_at TIMESTAMP
        )",
        [],
    )?;

    Ok(conn)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_init_db_in_memory() {
        let conn = init_db(":memory:").expect("Failed to init in-memory db");

        // テーブルが存在することを確認
        let tables: Vec<String> = conn
            .prepare("SELECT table_name FROM information_schema.tables WHERE table_schema = 'main'")
            .unwrap()
            .query_map([], |row| row.get(0))
            .unwrap()
            .map(|r| r.unwrap())
            .collect();

        assert!(tables.contains(&"logs".to_string()));
        assert!(tables.contains(&"metrics".to_string()));
        assert!(tables.contains(&"api_keys".to_string()));
    }

    #[test]
    fn test_init_db_idempotency() {
        let path = "test_idempotency.db";
        {
            let _conn = init_db(path).expect("First init failed");
        }
        {
            let _conn = init_db(path).expect("Second init failed");
        }
        let _ = std::fs::remove_file(path);
    }
}
