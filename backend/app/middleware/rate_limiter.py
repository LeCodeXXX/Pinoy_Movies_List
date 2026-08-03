"""Shared SlowAPI rate-limit configuration for the API."""

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


GLOBAL_LIMIT = "120/minute"
CATALOG_LIMIT = "60/minute"
MOVIE_DETAIL_LIMIT = "30/minute"
USER_DATA_LIMIT = "30/minute"
SEARCH_LIMIT = "10/minute"
WRITE_LIMIT = "20/minute"
LOGIN_LIMIT = "10/minute"


def user_or_ip(request: Request) -> str:
    """Use an authenticated user ID when available, otherwise the client IP."""
    user_id = getattr(request.state, "user_id", None)
    return f"user:{user_id}" if user_id else f"ip:{get_remote_address(request)}"


limiter = Limiter(
    key_func=user_or_ip,
    application_limits=[GLOBAL_LIMIT],
    headers_enabled=True,
    strategy="moving-window",
)

catalog_limit = limiter.shared_limit(CATALOG_LIMIT, scope="catalog")
movie_detail_limit = limiter.shared_limit(MOVIE_DETAIL_LIMIT, scope="movie-detail")
user_data_limit = limiter.shared_limit(USER_DATA_LIMIT, scope="user-data")
search_limit = limiter.shared_limit(SEARCH_LIMIT, scope="search")
write_limit = limiter.shared_limit(WRITE_LIMIT, scope="writes")
login_limit = limiter.shared_limit(
    LOGIN_LIMIT,
    scope="login",
    key_func=get_remote_address,
)


class GlobalRateLimitMiddleware(BaseHTTPMiddleware):
    """Enforce the application limit even when a route has its own limit."""

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        if limiter.enabled:
            try:
                # SlowAPI's stock middleware skips routes carrying a decorator,
                # so its application limit is otherwise absent from most APIs.
                limiter._check_request_limit(  # type: ignore[attr-defined]
                    request,
                    endpoint_func=None,
                    in_middleware=True,
                )
            except RateLimitExceeded as error:
                return _rate_limit_exceeded_handler(request, error)

        return await call_next(request)
