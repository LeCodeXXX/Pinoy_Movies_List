"""Cached application-generated statistics for externally sourced movies."""

from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MovieStatistic(Document):
    movie_id: Indexed(int, unique=True)
    title: str | None = None
    poster: str | None = None
    average_rating: float = Field(default=0, ge=0, le=10)
    total_ratings: int = Field(default=0, ge=0)
    total_reviews: int = Field(default=0, ge=0)
    total_favorites: int = Field(default=0, ge=0)
    total_watched: int = Field(default=0, ge=0)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings:
        name = "movie_statistics"
