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

pub fn get_oldest_timestamp(
    conn: &Connection,
    table: &str,
) -> Result<Option<chrono::DateTime<chrono::Utc>>> {
    let sql = format!("SELECT MIN(timestamp) FROM {}", table);
    let mut stmt = conn.prepare(&sql)?;
    let mut rows = stmt.query([])?;
    if let Some(row) = rows.next()? {
        let ts: Option<chrono::DateTime<chrono::Utc>> = row.get(0)?;
        Ok(ts)
    } else {
        Ok(None)
    }
}

pub fn delete_data_range(
    conn: &Connection,
    table: &str,
    start: chrono::DateTime<chrono::Utc>,
    end: chrono::DateTime<chrono::Utc>,
) -> Result<usize> {
    let sql = format!(
        "DELETE FROM {} WHERE timestamp >= ? AND timestamp < ?",
        table
    );
    conn.execute(&sql, duckdb::params![start, end])
}

pub fn checkpoint(conn: &Connection) -> Result<()> {
    conn.execute("CHECKPOINT", [])?;
    Ok(())
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
    fn test_delete_data_range() {
        let conn = init_db(":memory:").expect("Failed to init in-memory db");
        let now = chrono::Utc::now();
        let old = now - chrono::Duration::days(10);
        let older = now - chrono::Duration::days(20);

        conn.execute(
            "INSERT INTO logs (timestamp, message) VALUES (?, ?), (?, ?)",
            duckdb::params![old, "old message", older, "older message"],
        )
        .unwrap();

        let count = delete_data_range(
            &conn,
            "logs",
            older - chrono::Duration::days(1),
            older + chrono::Duration::minutes(1),
        )
        .unwrap();
        assert_eq!(count, 1);

        let oldest = get_oldest_timestamp(&conn, "logs").unwrap().unwrap();
        // oldest should now be 'old' (10 days ago), not 'older' (20 days ago)
        assert!(oldest > older);
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
