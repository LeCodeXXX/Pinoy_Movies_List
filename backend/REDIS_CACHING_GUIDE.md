# Redis caching in Pinoy Movies List

This guide explains what was implemented, why the cache sits where it does, how
to run it, and the Redis fundamentals needed to reason about the design.

## What the implementation does

The backend now caches successful JSON responses from TMDB. Every feature that
uses `TmdbClient` benefits automatically:

- movie details;
- Philippine movie discovery;
- movie search and the detail lookups used to validate Philippine origin;
- person profiles and credits; and
- company profiles and movie discovery.

MongoDB-backed data is deliberately not stored in this cache. Local ratings,
reviews, preferences, and rankings can therefore change without waiting for a
Redis entry to expire. A movie detail request may reuse cached TMDB metadata,
but it still reads the latest rating summary from MongoDB.

The source requirement file at `context/redis.md` was empty when this work was
performed, so the implementation uses conservative defaults: Redis is optional,
the default TTL is five minutes, only successful TMDB objects are cached, and a
Redis failure falls back to TMDB.

## Request flow

```text
Browser -> FastAPI route -> controller -> Movie/Credit service -> TmdbClient
                                                             |
                                                       build cache key
                                                             |
                                                     GET value from Redis
                                                       /             \
                                                    hit               miss
                                                     |                  |
                                             decode cached JSON    request TMDB
                                                     |                  |
                                                     |           validate response
                                                     |                  |
                                                     |          SET JSON with TTL
                                                      \                /
                                                       return TMDB data
                                                              |
                                             normalize response + query MongoDB
                                                              |
                                                        return to browser
```

This pattern is called **cache-aside** (or lazy loading). Application code first
checks the cache. On a miss, it loads from the authoritative source and places a
copy in the cache. Redis is not the source of truth; TMDB remains authoritative.

In simplified pseudocode:

```python
key = key_for(path, parameters)
cached = await cache.get(key)
if cached is not None:
    return cached

fresh = await tmdb.get(path, parameters)
await cache.set(key, fresh, expires_in=300)
return fresh
```

## Where each responsibility lives

### `app/core/config.py`

The settings model reads four new environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `REDIS_URL` | empty | Connection URL. An empty value disables caching. |
| `REDIS_KEY_PREFIX` | `pinoy-movies-list` | Namespaces this application's keys. |
| `REDIS_CACHE_TTL_SECONDS` | `300` | Lifetime of a cached TMDB response. |
| `REDIS_CONNECT_TIMEOUT_SECONDS` | `1` | Prevents an unavailable cache from delaying startup for long. |

The URL is a `SecretStr` because production Redis URLs can contain a password.
The TTL must be at least one second and the timeout must be greater than zero;
invalid values fail configuration validation early instead of producing vague
runtime behavior.

### `app/core/cache.py`

`RedisCache` owns the Redis connection. It exposes only the operations this
application needs: `connect`, `disconnect`, `get_json`, and `set_json`.

Keeping this wrapper small is useful. Business services do not need to know
about Redis commands, JSON encoding, connection details, or error classes. It
also gives tests a narrow interface to replace with a fake.

Values are serialized to compact JSON before `SET` and decoded after `GET`.
Every write includes `ex=ttl_seconds`, which makes Redis delete the key after
that number of seconds. A mandatory expiry prevents old TMDB data from living
forever and keeps memory usage bounded.

Keys become:

```text
pinoy-movies-list:tmdb:<sha256 digest>
```

The first part separates this project from other applications sharing the same
Redis instance. `tmdb` separates this data from future cache categories. The
digest represents the TMDB path and all request parameters.

### `app/services/tmdb_client.py`

`TmdbClient.get` implements cache-aside around the existing HTTP call. The key
input is serialized with sorted parameter names and compact separators before it
is hashed. Consequently these two dictionaries produce the same key:

```python
{"page": 1, "language": "en-US"}
{"language": "en-US", "page": 1}
```

Parameter values still matter. Page 1 and page 2, different languages, regions,
genres, sort orders, and search queries all receive separate entries. Without
this property, one user's request could incorrectly receive another request's
data.

Hashing makes keys fixed-length and avoids placing search text directly in Redis
key names. SHA-256 is being used as a deterministic identifier, not for password
security.

Only responses that passed TMDB status checks and decoded to a JSON object are
stored. Authentication errors, not-found responses, timeouts, and invalid JSON
are not cached. This prevents short-lived upstream failures from being replayed
for the full TTL.

### `app/main.py`

FastAPI's lifespan opens Redis once when the application starts and closes it
once during shutdown. Reusing a connection pool is much cheaper than opening a
TCP connection for every request. The same lifecycle already exists for MongoDB
and the shared HTTP client.

### Tests

`tests/test_tmdb_client_cache.py` verifies the behavior at the TMDB boundary:

- a cache hit returns without requiring an HTTP client;
- a miss calls TMDB and writes the successful response with the configured TTL;
- parameter order does not alter a key; and
- a meaningful parameter change does alter the key.

`tests/test_redis_cache.py` verifies JSON round trips, namespacing, expiry
arguments, malformed data handling, and fail-open Redis errors. The tests use
in-memory fakes and do not require a Redis server.

## Running Redis locally

Install the Python dependencies first:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

If Docker is available, one simple development server is:

```powershell
docker run --name pinoy-movies-redis -p 127.0.0.1:6379:6379 -d redis:7-alpine
```

Then place these values in the backend `.env`:

```dotenv
REDIS_URL=redis://localhost:6379/0
REDIS_KEY_PREFIX=pinoy-movies-list
REDIS_CACHE_TTL_SECONDS=300
REDIS_CONNECT_TIMEOUT_SECONDS=1
```

Restart the FastAPI process after changing `.env`. To confirm that Redis is
reachable and inspect the development keys:

```powershell
docker exec pinoy-movies-redis redis-cli PING
docker exec pinoy-movies-redis redis-cli --scan --pattern "pinoy-movies-list:*"
```

`PING` should print `PONG`. Call a movie endpoint twice; after the first call,
the scan should show one or more `tmdb` keys. To inspect remaining lifetime:

```powershell
docker exec pinoy-movies-redis redis-cli TTL <key-from-the-scan>
```

Do not use `KEYS *` in production. It scans the whole keyspace in one blocking
operation. `SCAN` incrementally iterates and is safer for a busy server.

## Important caching fundamentals

### Hit, miss, and hit ratio

A **hit** means Redis had the requested key. A **miss** means the application had
to call TMDB. Hit ratio is `hits / (hits + misses)`. A higher ratio usually means
fewer upstream calls and lower latency, but a high ratio is not automatically
good if the cached data is too old.

### TTL and freshness

TTL is a tradeoff:

- a longer TTL improves hit ratio and reduces TMDB traffic, but data remains
  stale longer;
- a shorter TTL provides fresher data, but causes more misses and upstream work.

Five minutes is a cautious starting point for movie metadata. Measure real
traffic before changing it. Different data categories may eventually deserve
different TTLs: movie credits are relatively stable, while provider availability
or popularity can change more frequently.

### Invalidation

**Invalidation** means removing or replacing cached data when it is no longer
valid. This implementation uses time-based invalidation: expiry removes entries
automatically. That is appropriate because TMDB changes outside this system, so
the backend has no reliable update event to react to.

If an administration feature later edits data that is also cached, invalidate
the exact key immediately after the authoritative write. Avoid deleting keys
before the authoritative write succeeds.

### Fail-open versus fail-closed

The cache is an optimization, not required correctness infrastructure. It
therefore **fails open**: connection, read, serialization, and write problems are
logged and treated as misses. Users can still receive data from TMDB.

A security control such as a login lockout counter may need to fail closed,
because bypassing it would change the system's safety guarantees. The right
failure mode depends on the responsibility, not on Redis itself.

### Cache stampede

When a popular key expires, many simultaneous requests can all miss and call
TMDB at once. This is a **cache stampede**. The current version does not add a
distributed lock because the added failure modes are not justified without
evidence of load. If metrics show a problem, common mitigations include:

- a short per-key lock so one worker refreshes while others wait;
- stale-while-revalidate, which serves a recently expired value during refresh;
- small random TTL jitter so many related keys do not expire simultaneously; or
- proactively refreshing a small set of known hot keys.

Distributed locks require careful expiry and ownership checks. A lock without a
timeout can deadlock requests if its owner crashes.

### Memory and eviction

Redis stores data in memory, so memory is finite. TTLs bound the lifetime of this
application's entries, but a production Redis instance should also have a memory
limit, monitoring, and an eviction policy chosen for its workloads. If the same
instance holds durable queues or security state, do not casually use an eviction
policy that may remove those keys. Separate Redis instances are often clearer
when responsibilities have different durability needs.

## Failure behavior

| Situation | Result |
| --- | --- |
| `REDIS_URL` is empty | Cache is disabled; TMDB requests work normally. |
| Redis is down during startup | A warning is logged; the app continues uncached. |
| Redis read fails | Treated as a miss; TMDB is called. |
| Redis contains malformed JSON | Treated as a miss; TMDB is called and replaces it. |
| Redis write fails | The fresh TMDB response is still returned. |
| TMDB returns an error | The existing application error is returned and not cached. |
| Cached entry expires | The next request is a miss and refreshes it. |

One consequence of startup fail-open behavior is that a process which could not
connect at startup remains uncached until it restarts. This keeps request-path
logic simple. A future health-check or reconnect loop can change that if
operational evidence shows a need.

## Production considerations

- Use an authenticated Redis URL and TLS when Redis is across an untrusted
  network. A typical TLS URL starts with `rediss://`.
- Never commit the real URL or password. `.env` is ignored by Git; production
  should preferably inject secrets through its deployment platform.
- Restrict network access so Redis is not publicly reachable.
- Monitor cache hits, misses, command latency, Redis memory, evictions, TMDB call
  volume, and cache error logs.
- Keep the application prefix unique per environment, such as
  `pinoy-movies-list:staging` and `pinoy-movies-list:production`, if environments
  share a Redis server.
- Avoid caching personalized or secret data unless the key includes the correct
  identity and the privacy implications are understood.

## Suggested next improvements

The present design is intentionally small. Add complexity only in response to a
measured need. Useful next steps would be cache hit/miss metrics, separate TTLs
for stable details and volatile discovery results, and an application health
endpoint that reports Redis as an optional dependency. Stampede protection is a
later optimization if concurrent misses actually become significant.
