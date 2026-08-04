# Important implementation details in the backend

### JWT authentication

The backend creates signed HS256 access tokens containing the user ID, issued time, expiration time, and token type.

```
Authorization: Bearer <access-token>
```

Middleware validates tokens and exposes the authenticated user ID to protected routes. User-specific endpoints also verify that the requested user matches the token.

### Rate limiting

SlowAPI applies moving-window limits by authenticated user or client IP. Limits cover global traffic, catalog requests, movie details, searches, login attempts, writes, and user data.

### Redis caching

Redis is optional and fail-open. When REDIS_URL is configured, the backend connects during startup, stores expiring JSON values, namespaces keys with REDIS_KEY_PREFIX, and closes the connection during shutdown. Redis failures become cache misses, so the API can continue without caching.

## Local requirements

- Node.js and npm.
- Python 3.11 or newer recommended.
- Docker Desktop.
- MongoDB locally or MongoDB Atlas.
- TMDB API access token.

## Local setup

The commands below use Windows PowerShell.

### 1. Start Redis with Docker

```
docker run --name pinoy-movies-redis -p 6379:6379 -d redis:7-alpine
docker ps
```

Redis URL for local development:

```
redis://localhost:6379/0
```

Manage the container:

```
docker stop pinoy-movies-redis
docker start pinoy-movies-redis
docker rm -f pinoy-movies-redis
```

### 2. Configure the backend

```
cd backend
Copy-Item .env.example .env
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Open **backend/.env** and copy the following template. Replace every placeholder value:

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=pinoy_movies_list

# TMDB
TMDB_ACCESS_TOKEN=your_tmdb_token

# Redis
# Leave REDIS_URL empty if you do not want to use Redis.
REDIS_URL=redis://localhost:6379/0
REDIS_KEY_PREFIX=pinoy-movies-list
REDIS_CACHE_TTL_SECONDS=300
REDIS_CONNECT_TIMEOUT_SECONDS=1

# JWT
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRE_MINUTES=60
```

Variable reference:

| Variable | What to enter |
| --- | --- |
| MONGODB_URI | Local MongoDB URL or MongoDB Atlas connection string. |
| MONGODB_DATABASE | Name of the application database. |
| TMDB_ACCESS_TOKEN | TMDB API access token. |
| REDIS_URL | Local Docker URL or hosted Redis URL. |
| REDIS_KEY_PREFIX | Prefix used for this application's cache keys. |
| REDIS_CACHE_TTL_SECONDS | Cache lifetime in seconds. |
| REDIS_CONNECT_TIMEOUT_SECONDS | Redis connection timeout. |
| JWT_SECRET | Long random secret used to sign tokens. |
| JWT_EXPIRE_MINUTES | Token lifetime in minutes. |

Start the API:

```
python -m uvicorn app.main:app --reload
```

API documentation: http://127.0.0.1:8000/docs

## LAN testing

Start the backend(run this first before the frontend):

```
python -m uvicorn app.main:app --host [IP_ADDRESS or 0.0.0.0] --port 8000
```