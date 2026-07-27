from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.movies import router as movies_router
from app.core.database import database
from app.core.exceptions import ApplicationError
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(movies_router, prefix="/api")


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
