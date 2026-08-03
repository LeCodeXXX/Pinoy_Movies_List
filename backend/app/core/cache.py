"""Optional Redis-backed JSON cache used by external API clients."""

import json
import logging
from typing import Any

from redis.asyncio import Redis
from redis.exceptions import RedisError

from app.core.config import settings

logger = logging.getLogger(__name__)


class RedisCache:
    """Own a Redis connection and expose a small, fail-open cache API."""

    def __init__(self) -> None:
        self._client: Redis | None = None

    @property
    def is_connected(self) -> bool:
        return self._client is not None

    async def connect(self) -> None:
        url = settings.redis_url.get_secret_value().strip()
        if not url:
            logger.info("Redis caching is disabled because REDIS_URL is not set")
            return

        client = Redis.from_url(
            url,
            decode_responses=True,
            socket_connect_timeout=settings.redis_connect_timeout_seconds,
            socket_timeout=settings.redis_connect_timeout_seconds,
        )
        try:
            await client.ping()
        except RedisError as exc:
            await client.aclose()
            logger.warning("Redis is unavailable; continuing without caching: %s", exc)
            return

        self._client = client
        logger.info("Redis cache connection established")

    async def disconnect(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    async def get_json(self, key: str) -> dict[str, Any] | None:
        """Return a decoded JSON object, treating errors as cache misses."""
        if self._client is None:
            return None

        try:
            value = await self._client.get(self._namespaced(key))
            if value is None:
                return None
            decoded = json.loads(value)
            return decoded if isinstance(decoded, dict) else None
        except (RedisError, json.JSONDecodeError, TypeError) as exc:
            logger.warning("Redis cache read failed for %s: %s", key, exc)
            return None

    async def set_json(
        self,
        key: str,
        value: dict[str, Any],
        ttl_seconds: int,
    ) -> None:
        """Store a JSON object with a mandatory expiry, ignoring cache errors."""
        if self._client is None:
            return

        try:
            await self._client.set(
                self._namespaced(key),
                json.dumps(value, separators=(",", ":")),
                ex=ttl_seconds,
            )
        except (RedisError, TypeError, ValueError) as exc:
            logger.warning("Redis cache write failed for %s: %s", key, exc)

    @staticmethod
    def _namespaced(key: str) -> str:
        return f"{settings.redis_key_prefix}:{key}"


redis_cache = RedisCache()
