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
