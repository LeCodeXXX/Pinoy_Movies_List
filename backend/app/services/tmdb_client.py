"""Asynchronous HTTP client for the TMDB API."""

from typing import Any

import httpx

from app.core.config import settings
from app.core.exceptions import (
    MovieNotFoundError,
    TmdbAuthenticationError,
    TmdbConfigurationError,
    TmdbUnavailableError,
)


class TmdbClient:
    """Own and reuse the connection pool used for TMDB requests."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

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
        client = self._require_client()
        try:
            response = await client.get(path, params=params)
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise TmdbUnavailableError() from exc

        self._raise_for_status(response, movie_id)
        try:
            return response.json()
        except ValueError as exc:
            raise TmdbUnavailableError("TMDB returned an invalid response") from exc

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


tmdb_client = TmdbClient()
