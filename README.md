# Pinoy Cinema Vault

Pinoy Cinema Vault is a Filipino movie discovery and personal tracking platform inspired by MyAnimeList and IMDb, but focused on Pinoy and Philippine-related cinema.

Users can browse and search movies, inspect movie details, explore people and production companies, and manage a profile containing saved movies, favorites, ratings, and reviews.

## Features

- Popular movie catalog with genre carousels.
- Popular, best-rated, and most-voted rankings.
- Search by title, director, description, or genre.
- Advanced release-period, rating, year, and genre filters.
- Movie details with synopsis, genres, cast, crew, companies, trailers, ratings, and similar movies.
- Person and production-company pages with related movies.
- Account registration and JWT authentication.
- Completed, Watching, and Plan to Watch statuses.
- Personal 1-10 ratings, favorites, and written reviews.
- Profile statistics, rating distribution, and genre breakdowns.
- Responsive desktop, tablet, and phone layouts.

## User flow

1. Browse popular movies or a genre section.
2. Search or apply advanced filters.
3. Open a movie details page.
4. Review metadata, cast, trailer, community score, and similar movies.
5. Open a related person or production-company page.
6. Register or log in to save the movie.
7. Set a status, rating, favorite flag, or review.
8. Manage saved activity from the profile page.

## Technology stack

- **Frontend:** Next.js 16.2.11, React 19.2.4, TypeScript, Tailwind CSS 4, TanStack React Query, Recharts, and Next Image.
- **Backend:** FastAPI 0.115.0, Uvicorn, Pydantic Settings, PyJWT, SlowAPI, and redis.asyncio.
- **Data:** MongoDB with Beanie/Motor, Redis cache, and TMDB movie data.
- **Deployment:** Render Web Service for the API and Render Key Value for Redis.

## Important implementation details

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

### 3. Configure the frontend

Open a second terminal:

```
cd frontend
Copy-Item .env.example .env.local
npm install
```

Open **frontend/.env.local**:

```
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

This is the backend URL that the browser will call. Start Next.js:

```
npm run dev
```

Open http://localhost:3000.

## LAN testing

Start the backend:

```
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Start the frontend:

```
npm run dev
```

For a host computer with LAN IP 192.168.1.9, use this in **frontend/.env.local**:

```
NEXT_PUBLIC_API_BASE_URL=http://192.168.1.9:8000
```

The backend CORS configuration must allow http://192.168.1.9:3000. Use the actual IPv4 address, keep devices on the same network, and allow the ports through the firewall.

## Validation and production deployment

```
cd frontend
npm run lint
npm run build
npm start
```

Do not use Next.js development mode or Uvicorn reload in production. A production API command is:

```
uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 2
```

Use HTTPS and the hosting platform's assigned port.

## Render deployment

Create a Render Web Service for the backend:

| Setting | Value |
| --- | --- |
| Root Directory | backend |
| Build Command | pip install -r requirements.txt |
| Start Command | uvicorn app.main:app --host 0.0.0.0 --port $PORT |

Create a separate Render Key Value instance for Redis and put its internal connection URL in REDIS_URL. Keep both services in the same region.

Production backend variables:

```
MONGODB_URI=your-mongodb-atlas-uri
MONGODB_DATABASE=pinoy_movies_list
TMDB_ACCESS_TOKEN=your-production-token

JWT_SECRET=long-random-production-secret
JWT_EXPIRE_MINUTES=60

REDIS_URL=your-render-key-value-url
REDIS_KEY_PREFIX=pinoy-movies-list-prod
REDIS_CACHE_TTL_SECONDS=300
REDIS_CONNECT_TIMEOUT_SECONDS=1
```

The deployed frontend should use:

```
NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com
```

Restrict backend CORS to the deployed frontend domain.
