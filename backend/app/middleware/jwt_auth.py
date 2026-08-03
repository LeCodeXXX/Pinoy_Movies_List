"""JWT creation, validation, and request authentication state."""

from __future__ import annotations

from typing import Any

import jwt
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings


def _secret() -> str:
    secret = settings.jwt_secret.get_secret_value().strip()
    if not secret:
        raise RuntimeError("JWT_SECRET is not configured")
    return secret


def create_access_token(user_id: str) -> str:
    import time

    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + settings.jwt_expire_minutes * 60,
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, _secret(), algorithms=["HS256"])
        if payload.get("type") != "access" or not isinstance(payload.get("sub"), str):
            raise jwt.InvalidTokenError("Invalid access token claims")
        return payload
    except (jwt.InvalidTokenError, RuntimeError) as error:
        raise ValueError("Invalid or expired access token") from error


class JWTAuthenticationMiddleware(BaseHTTPMiddleware):
    """Authenticate an optional bearer token and expose its user ID on state."""

    async def dispatch(self, request: Request, call_next):
        authorization = request.headers.get("Authorization", "")
        if authorization:
            scheme, _, token = authorization.partition(" ")
            if scheme.lower() != "bearer" or not token:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Authorization must use a bearer token"},
                    headers={"WWW-Authenticate": "Bearer"},
                )
            try:
                payload = decode_access_token(token)
            except ValueError:
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid or expired access token"},
                    headers={"WWW-Authenticate": "Bearer"},
                )
            request.state.user_id = payload["sub"]

        return await call_next(request)


def current_user_id(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication is required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return str(user_id)


def require_same_user(user_id: str, request: Request) -> str:
    authenticated_id = current_user_id(request)
    if authenticated_id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return authenticated_id
