"""Database documents for a user's interactions with externally sourced movies."""

from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field
from pymongo import ASCENDING, IndexModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class MovieInteraction(Document):
    user_id: Indexed(str)
    movie_id: Indexed(int)

    class Settings:
        indexes = [IndexModel([("user_id", ASCENDING), ("movie_id", ASCENDING)], unique=True)]


class Favorite(MovieInteraction):
    added_at: datetime = Field(default_factory=utc_now)

    class Settings(MovieInteraction.Settings):
        name = "favorites"


class WatchHistory(MovieInteraction):
    watched_at: datetime = Field(default_factory=utc_now)

    class Settings(MovieInteraction.Settings):
        name = "watch_history"


class Rating(MovieInteraction):
    rating: int = Field(ge=1, le=10)
    rated_at: datetime = Field(default_factory=utc_now)

    class Settings(MovieInteraction.Settings):
        name = "ratings"


class Review(MovieInteraction):
    review: str = Field(min_length=1, max_length=5_000)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings(MovieInteraction.Settings):
        name = "reviews"
