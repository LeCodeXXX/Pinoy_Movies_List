"""Tests for TMDB's cache-aside behavior and cache-key construction."""

from typing import Any
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock

import httpx

from app.core.config import settings
from app.services.tmdb_client import TmdbClient


class FakeCache:
    def __init__(self, cached: dict[str, Any] | None = None) -> None:
        self.cached = cached
        self.read_keys: list[str] = []
        self.writes: list[tuple[str, dict[str, Any], int]] = []

    async def get_json(self, key: str) -> dict[str, Any] | None:
        self.read_keys.append(key)
        return self.cached

    async def set_json(
        self,
        key: str,
        value: dict[str, Any],
        ttl_seconds: int,
    ) -> None:
        self.writes.append((key, value, ttl_seconds))


class TmdbClientCacheTests(IsolatedAsyncioTestCase):
    async def test_cache_hit_skips_tmdb_request(self) -> None:
        cached = {"id": 770, "title": "Cached Film"}
        cache = FakeCache(cached)
        client = TmdbClient(cache)  # type: ignore[arg-type]

        result = await client.get("/movie/770", params={"language": "en-US"})

        self.assertEqual(result, cached)
        self.assertEqual(len(cache.read_keys), 1)
        self.assertEqual(cache.writes, [])

    async def test_cache_miss_fetches_tmdb_and_stores_success(self) -> None:
        cache = FakeCache()
        client = TmdbClient(cache)  # type: ignore[arg-type]
        response = httpx.Response(
            200,
            json={"id": 770, "title": "Fresh Film"},
            request=httpx.Request("GET", "https://example.test/movie/770"),
        )
        http_client = AsyncMock()
        http_client.get.return_value = response
        client._client = http_client

        result = await client.get("/movie/770", params={"language": "en-US"})

        self.assertEqual(result["title"], "Fresh Film")
        http_client.get.assert_awaited_once_with(
            "/movie/770", params={"language": "en-US"}
        )
        self.assertEqual(len(cache.writes), 1)
        self.assertEqual(cache.writes[0][0], cache.read_keys[0])
        self.assertEqual(cache.writes[0][1], result)
        self.assertEqual(cache.writes[0][2], settings.redis_cache_ttl_seconds)

    def test_cache_key_is_stable_across_parameter_order(self) -> None:
        first = TmdbClient._cache_key(
            "/discover/movie", {"page": 1, "language": "en-US"}
        )
        second = TmdbClient._cache_key(
            "/discover/movie", {"language": "en-US", "page": 1}
        )

        self.assertEqual(first, second)

    def test_cache_key_changes_when_a_parameter_changes(self) -> None:
        first = TmdbClient._cache_key("/discover/movie", {"page": 1})
        second = TmdbClient._cache_key("/discover/movie", {"page": 2})

        self.assertNotEqual(first, second)
