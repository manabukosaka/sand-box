use axum::{
    extract::{Request, State},
    http::{self, StatusCode},
    middleware::Next,
    response::Response,
};
use dashmap::DashMap;
use std::sync::Arc;
use tracing::warn;

pub struct AuthState {
    // key: key_hash, value: service_name
    pub api_keys: DashMap<String, String>,
}

pub async fn api_key_auth(
    State(auth_state): State<Arc<AuthState>>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let auth_header = req
        .headers()
        .get("X-API-Key")
        .and_then(|header| header.to_str().ok());

    match auth_header {
        Some(key) if auth_state.api_keys.contains_key(key) => {
            Ok(next.run(req).await)
        }
        _ => {
            warn!("Unauthorized access attempt with key: {:?}", auth_header);
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}
