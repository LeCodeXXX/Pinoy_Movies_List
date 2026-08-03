"""Unit coverage for Redis JSON serialization and fail-open behavior."""

from unittest import IsolatedAsyncioTestCase

from redis.exceptions import RedisError

from app.core.cache import RedisCache
from app.core.config import settings


class FakeRedis:
    def __init__(self) -> None:
        self.values: dict[str, str] = {}
        self.set_calls: list[tuple[str, str, int]] = []

    async def get(self, key: str) -> str | None:
        return self.values.get(key)

    async def set(self, key: str, value: str, ex: int) -> None:
        self.values[key] = value
        self.set_calls.append((key, value, ex))


class FailingRedis:
    async def get(self, key: str) -> str | None:
        raise RedisError("read unavailable")

    async def set(self, key: str, value: str, ex: int) -> None:
        raise RedisError("write unavailable")


class RedisCacheTests(IsolatedAsyncioTestCase):
    async def test_json_round_trip_uses_namespace_and_ttl(self) -> None:
        backend = FakeRedis()
        cache = RedisCache()
        cache._client = backend  # type: ignore[assignment]

        await cache.set_json("tmdb:test", {"id": 770}, ttl_seconds=45)
        result = await cache.get_json("tmdb:test")

        self.assertEqual(result, {"id": 770})
        self.assertEqual(
            backend.set_calls,
            [(f"{settings.redis_key_prefix}:tmdb:test", '{"id":770}', 45)],
        )

    async def test_invalid_json_is_treated_as_a_cache_miss(self) -> None:
        backend = FakeRedis()
        backend.values[f"{settings.redis_key_prefix}:tmdb:bad"] = "not-json"
        cache = RedisCache()
        cache._client = backend  # type: ignore[assignment]

        result = await cache.get_json("tmdb:bad")

        self.assertIsNone(result)

    async def test_redis_errors_do_not_escape_to_the_application(self) -> None:
        cache = RedisCache()
        cache._client = FailingRedis()  # type: ignore[assignment]

        result = await cache.get_json("tmdb:test")
        await cache.set_json("tmdb:test", {"id": 770}, ttl_seconds=45)

        self.assertIsNone(result)
