"""Database documents for a user's interactions with externally sourced movies."""

from datetime import date, datetime, timezone

from beanie import Document, Indexed
from pydantic import BaseModel, Field
from pymongo import ASCENDING, DESCENDING, IndexModel


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


class MovieSnapshot(BaseModel):
    """Small TMDB snapshot used to render a list without repeated API requests."""

    id: int
    title: str
    original_title: str
    original_language: str
    poster_url: str | None = None
    backdrop_url: str | None = None
    synopsis: str = ""
    release_date: date | None = None
    genre_ids: list[int] = Field(default_factory=list)
    popularity: float = 0
    tmdb_vote_average: float = 0
    tmdb_vote_count: int = 0


class MoviePreference(MovieInteraction):
    """A user's single source of truth for one entry in their movie list."""

    status: str
    rating: int | None = Field(default=None, ge=1, le=10)
    is_favorite: bool = False
    movie: MovieSnapshot
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)

    class Settings(MovieInteraction.Settings):
        name = "movie_preferences"
        indexes = [
            *MovieInteraction.Settings.indexes,
            IndexModel([("user_id", ASCENDING), ("updated_at", DESCENDING)]),
        ]
