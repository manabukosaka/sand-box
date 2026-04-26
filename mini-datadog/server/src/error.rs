use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    DbError(#[from] duckdb::Error),

    #[error("Internal server error: {0}")]
    Internal(String),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Axum error: {0}")]
    AxumError(#[from] axum::Error),

    #[error("Lock acquisition failed")]
    LockError,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::DbError(e) => {
                tracing::error!("Database error: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Database error".to_string(),
                )
            }
            AppError::Internal(e) => {
                tracing::error!("Internal error: {}", e);
                (StatusCode::INTERNAL_SERVER_ERROR, e)
            }
            AppError::Serialization(e) => {
                tracing::error!("Serialization error: {}", e);
                (StatusCode::BAD_REQUEST, "Invalid data format".to_string())
            }
            AppError::AxumError(e) => {
                tracing::error!("Axum error: {}", e);
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error".to_string(),
                )
            }
            AppError::LockError => {
                tracing::error!("Mutex lock poisoned");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Internal server error".to_string(),
                )
            }
        };

        let body = Json(json!({
            "error": error_message,
        }));

        (status, body).into_response()
    }
}
