"""Application settings loaded from the backend environment."""

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_database: str = "pinoy_movies_list"
    jwt_secret: SecretStr = SecretStr("")
    jwt_expire_minutes: int = 60
    tmdb_access_token: SecretStr = SecretStr("")
    tmdb_api_base_url: str = "https://api.themoviedb.org/3"
    tmdb_image_base_url: str = "https://image.tmdb.org/t/p"
    tmdb_default_language: str = "en-US"
    tmdb_default_region: str = "PH"
    tmdb_timeout_seconds: float = 10.0
    redis_url: SecretStr = SecretStr("")
    redis_key_prefix: str = "pinoy-movies-list"
    redis_cache_ttl_seconds: int = Field(default=300, ge=1)
    redis_connect_timeout_seconds: float = Field(default=1.0, gt=0)
    frontend_url: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
