use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogRecord {
    pub timestamp: DateTime<Utc>,
    #[serde(default = "Utc::now")]
    pub received_at: DateTime<Utc>,
    pub level: String,
    pub service: String,
    pub message: String,
    pub tags: Option<Value>,
    pub attributes: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MetricRecord {
    pub timestamp: DateTime<Utc>,
    pub name: String,
    pub value: f64,
    pub service: String,
    pub tags: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKey {
    pub key_hash: String,
    pub service_name: String,
    pub created_at: DateTime<Utc>,
}

// --- Query API Models ---

#[derive(Debug, Deserialize, Serialize)]
pub struct LogQueryRequest {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
    pub query: Option<String>,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LogQueryResponse {
    pub total: usize,
    pub hits: Vec<LogRecord>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct MetricQueryRequest {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
    pub metric_name: String,
    pub service: Option<String>,
    pub interval: Option<String>, // e.g., "1m", "1h"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetricValue {
    pub timestamp: DateTime<Utc>,
    pub value: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MetricQueryResponse {
    pub metric_name: String,
    pub results: Vec<MetricValue>,
}
