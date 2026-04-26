use axum::{
    extract::{Request, State, Query},
    http::StatusCode,
    middleware::Next,
    response::Response,
};
use dashmap::DashMap;
use std::sync::Arc;
use serde::Deserialize;
use tracing::warn;

pub struct AuthState {
    pub api_keys: DashMap<String, String>,
}

#[derive(Deserialize)]
pub struct AuthParams {
    pub api_key: Option<String>,
}

pub async fn api_key_auth(
    State(auth_state): State<Arc<AuthState>>,
    req: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // 1. ヘッダーからの取得を試行 (Ingest / Query API 用)
    let header_key = req
        .headers()
        .get("X-API-Key")
        .and_then(|h| h.to_str().ok());

    // 2. クエリパラメータからの取得を試行 (EventSource / SSE 用)
    let query_key = req.uri().query()
        .and_then(|q| serde_urlencoded::from_str::<AuthParams>(q).ok())
        .and_then(|p| p.api_key);

    let key = header_key.or(query_key.as_deref());

    match key {
        Some(k) if auth_state.api_keys.contains_key(k) => {
            Ok(next.run(req).await)
        }
        _ => {
            warn!("Unauthorized access attempt to: {}", req.uri());
            Err(StatusCode::UNAUTHORIZED)
        }
    }
}
