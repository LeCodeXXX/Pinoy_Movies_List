"""Validation and response contracts for a user's movie list."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field

from app.schemas.movie import MovieSummaryResponse


class MovieListStatus(str, Enum):
    completed = "completed"
    watching = "watching"
    plan_to_watch = "plan_to_watch"


class MoviePreferenceUpsertRequest(BaseModel):
    status: MovieListStatus
    rating: int | None = Field(default=None, ge=1, le=10)
    is_favorite: bool = False


class MoviePreferenceResponse(BaseModel):
    id: str
    user_id: str
    movie_id: int
    status: MovieListStatus
    rating: int | None
    is_favorite: bool
    movie: MovieSummaryResponse
    created_at: datetime
    updated_at: datetime


class MoviePreferenceListResponse(BaseModel):
    results: list[MoviePreferenceResponse]
