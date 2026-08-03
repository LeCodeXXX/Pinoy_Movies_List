"""Asynchronous HTTP client for the TMDB API with cache-aside Redis reads."""

import hashlib
import json
from typing import Any

import httpx

from app.core.cache import RedisCache, redis_cache
from app.core.config import settings
from app.core.exceptions import (
    MovieNotFoundError,
    TmdbAuthenticationError,
    TmdbConfigurationError,
    TmdbUnavailableError,
)


class TmdbClient:
    """Own and reuse the connection pool used for TMDB requests."""

    def __init__(self, cache: RedisCache | None = None) -> None:
        self._client: httpx.AsyncClient | None = None
        self._cache = cache

    async def connect(self) -> None:
        token = settings.tmdb_access_token.get_secret_value().strip()
        if not token:
            return

        self._client = httpx.AsyncClient(
            base_url=settings.tmdb_api_base_url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
            timeout=settings.tmdb_timeout_seconds,
        )

    async def disconnect(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def get(
        self,
        path: str,
        params: dict[str, str | int | bool] | None = None,
        movie_id: int | None = None,
    ) -> dict[str, Any]:
        cache_key = self._cache_key(path, params)
        if self._cache is not None:
            cached = await self._cache.get_json(cache_key)
            if cached is not None:
                return cached

        client = self._require_client()
        try:
            response = await client.get(path, params=params)
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise TmdbUnavailableError() from exc

        self._raise_for_status(response, movie_id)
        try:
            data = response.json()
        except ValueError as exc:
            raise TmdbUnavailableError("TMDB returned an invalid response") from exc

        if not isinstance(data, dict):
            raise TmdbUnavailableError("TMDB returned an invalid response")

        if self._cache is not None:
            await self._cache.set_json(
                cache_key,
                data,
                settings.redis_cache_ttl_seconds,
            )
        return data

    @staticmethod
    def _cache_key(
        path: str,
        params: dict[str, str | int | bool] | None,
    ) -> str:
        """Build the same compact key for semantically identical requests."""
        request_identity = json.dumps(
            {"path": path, "params": params or {}},
            sort_keys=True,
            separators=(",", ":"),
        )
        digest = hashlib.sha256(request_identity.encode("utf-8")).hexdigest()
        return f"tmdb:{digest}"

    def _require_client(self) -> httpx.AsyncClient:
        if self._client is None:
            raise TmdbConfigurationError()
        return self._client

    @staticmethod
    def _raise_for_status(response: httpx.Response, movie_id: int | None) -> None:
        if response.status_code == 404 and movie_id is not None:
            raise MovieNotFoundError(movie_id)
        if response.status_code in {401, 403}:
            raise TmdbAuthenticationError()
        if response.is_error:
            raise TmdbUnavailableError()


tmdb_client = TmdbClient(redis_cache)
