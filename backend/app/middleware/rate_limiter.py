"""Shared SlowAPI rate-limit configuration for the API."""

from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


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
