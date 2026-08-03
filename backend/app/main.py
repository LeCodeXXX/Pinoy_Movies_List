from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.auth import router as auth_router
from app.api.credits import router as credits_router
from app.api.movie_preferences import router as movie_preferences_router
from app.api.movie_reviews import router as movie_reviews_router
from app.api.movies import router as movies_router
from app.core.cache import redis_cache
from app.core.database import database
from app.core.exceptions import ApplicationError
from app.middleware.rate_limiter import GlobalRateLimitMiddleware, limiter
from app.middleware.jwt_auth import JWTAuthenticationMiddleware
from app.services.tmdb_client import tmdb_client

from app.core.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    await database.connect()
    try:
        await redis_cache.connect()
        await tmdb_client.connect()
        yield
    finally:
        await tmdb_client.disconnect()
        await redis_cache.disconnect()
        await database.disconnect()

app = FastAPI(title="Pinoy Movies List API", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS configuration (change as the project grows)
app.add_middleware(GlobalRateLimitMiddleware)
app.add_middleware(JWTAuthenticationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(movies_router, prefix="/api")
app.include_router(credits_router, prefix="/api")
app.include_router(movie_preferences_router, prefix="/api")
app.include_router(movie_reviews_router, prefix="/api")


@app.exception_handler(ApplicationError)
async def application_error_handler(
    _: Request,
    error: ApplicationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=error.status_code,
        content={"detail": error.detail},
    )

@app.get("/")
async def root():
    return {"message": "Pinoy Movies List API"}
