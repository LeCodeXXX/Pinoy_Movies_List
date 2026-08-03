from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.auth import router as auth_router
from app.api.credits import router as credits_router
from app.api.movie_preferences import router as movie_preferences_router
from app.api.movie_reviews import router as movie_reviews_router
from app.api.movies import router as movies_router
from app.core.database import database
from app.core.exceptions import ApplicationError
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.jwt_auth import JWTAuthenticationMiddleware
from app.services.tmdb_client import tmdb_client


@asynccontextmanager
async def lifespan(_: FastAPI):
    await database.connect()
    await tmdb_client.connect()
    try:
        yield
    finally:
        await tmdb_client.disconnect()
        await database.disconnect()

app = FastAPI(title="Pinoy Movies List API", lifespan=lifespan)

# CORS configuration (change as the project grows)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(JWTAuthenticationMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
