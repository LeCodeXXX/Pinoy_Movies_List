"""MongoDB and Beanie initialization for the FastAPI application."""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.models.movie_statistic import MovieStatistic
from app.models.user import User
from app.models.user_movie_data import (
    Favorite,
    MoviePreference,
    Rating,
    Review,
    WatchHistory,
)


class Database:
    """Own the MongoDB client for the lifetime of the application."""

    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None

    async def connect(self) -> None:
        self.client = AsyncIOMotorClient(
            settings.mongodb_uri,
            serverSelectionTimeoutMS=5_000,
        )
        await self.client.admin.command("ping")

        database = self.client[settings.mongodb_database]
        await init_beanie(
            database=database,
            document_models=[
                User,
                Favorite,
                Rating,
                Review,
                WatchHistory,
                MoviePreference,
                MovieStatistic,
            ],
        )

    async def disconnect(self) -> None:
        if self.client is not None:
            self.client.close()
            self.client = None


database = Database()
