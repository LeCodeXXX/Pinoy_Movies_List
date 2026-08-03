"""Simple in-process, user-aware API rate limiting middleware.

The authenticated-user identity is intentionally read from authentication
middleware state rather than from a URL parameter or an untrusted header.
Until authentication middleware is added, requests are treated as guests and
are therefore limited by client IP.
"""

from __future__ import annotations

import time
from collections import deque
from dataclasses import dataclass
from typing import Deque

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware


WINDOW_SECONDS = 60
GET_LIMIT = 25
WRITE_LIMIT = 20
LOGIN_LIMIT = 10


@dataclass(frozen=True)
class Limit:
    maximum: int
    window_seconds: int = WINDOW_SECONDS


class InMemoryRateLimiter:
    """A rolling-window counter suitable for a single application process."""

    def __init__(self) -> None:
        self._requests: dict[str, Deque[float]] = {}

    def check(self, key: str, limit: Limit, now: float | None = None) -> tuple[bool, int, int]:
        current_time = time.monotonic() if now is None else now
        timestamps = self._requests.setdefault(key, deque())
        cutoff = current_time - limit.window_seconds

        while timestamps and timestamps[0] <= cutoff:
            timestamps.popleft()

        allowed = len(timestamps) < limit.maximum
        if allowed:
            timestamps.append(current_time)

        remaining = max(0, limit.maximum - len(timestamps))
        retry_after = 0
        if not allowed and timestamps:
            retry_after = max(1, int(timestamps[0] + limit.window_seconds - current_time))
        return allowed, remaining, retry_after


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Apply API limits by authenticated user, or by IP for guests."""

    def __init__(self, app, limiter: InMemoryRateLimiter | None = None) -> None:
        super().__init__(app)
        self.limiter = limiter or InMemoryRateLimiter()

    @staticmethod
    def _identity(request: Request) -> tuple[str, str]:
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return "user", str(user_id)

        # Access the scope directly. Request.user raises an assertion when
        # Starlette's separate AuthenticationMiddleware is not installed.
        user = request.scope.get("user")
        if getattr(user, "is_authenticated", False):
            authenticated_id = getattr(user, "id", None) or getattr(user, "username", None)
            if authenticated_id:
                return "user", str(authenticated_id)

        # Do not trust X-Forwarded-For here without a configured trusted proxy.
        return "ip", request.client.host if request.client else "unknown"

    @staticmethod
    def _limit_for(request: Request) -> Limit | None:
        if not request.url.path.startswith("/api"):
            return None
        if request.url.path == "/api/movies/search":
            return None
        if request.url.path == "/api/auth/login" and request.method == "POST":
            return Limit(LOGIN_LIMIT)
        if request.method == "GET":
            return Limit(GET_LIMIT)
        if request.method in {"POST", "PUT", "PATCH", "DELETE"}:
            return Limit(WRITE_LIMIT)
        return None

    async def dispatch(self, request: Request, call_next):
        limit = self._limit_for(request)
        if limit is None:
            return await call_next(request)

        identity_type, identity = self._identity(request)
        # Login is deliberately always IP-based, including for a future
        # authenticated session, because it protects credential attempts.
        if request.url.path == "/api/auth/login":
            client_ip = request.client.host if request.client else "unknown"
            key = f"login:ip:{client_ip}"
        else:
            key = f"{request.method.lower()}:{identity_type}:{identity}"
        allowed, remaining, retry_after = self.limiter.check(key, limit)
        headers = {
            "X-RateLimit-Limit": str(limit.maximum),
            "X-RateLimit-Remaining": str(remaining),
        }
        if not allowed:
            headers["Retry-After"] = str(retry_after)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."},
                headers=headers,
            )

        response = await call_next(request)
        for name, value in headers.items():
            response.headers[name] = value
        return response
