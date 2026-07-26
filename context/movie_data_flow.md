# Movie Information Retrieval Flow

## Overview

The application does **not** store movie or TV show metadata inside MongoDB. Instead, it retrieves movie information on demand from external movie databases through their APIs. This approach keeps the database lightweight, ensures information stays up to date, and avoids the need to manually maintain thousands of movie records.

MongoDB is reserved only for application-specific data, such as user accounts, ratings, reviews, watchlists, favorites, and other user-generated content.

---

# Information Retrieval Flow

## 1. User Searches for a Movie

A user enters a movie title into the search bar.

Example:

```
Heneral Luna
```

The frontend sends a request to the FastAPI backend.

```
Next.js
    │
    ▼
FastAPI
```

---

## 2. Backend Receives the Request

FastAPI validates the search query and forwards the request to the external movie API.

```
GET /movies/search?q=Heneral Luna
```

---

## 3. External Movie Database

The backend queries an external movie database.

Possible providers include:

- TMDB (The Movie Database)
- Wikidata
- Wikipedia
- Other Filipino movie datasets (if available)

The external provider returns matching movies.

```
FastAPI
    │
    ▼
External Movie API
    │
    ▼
Movie Results
```

---

## 4. Backend Formats the Response

Since different providers may return different response structures, FastAPI converts the data into a consistent internal format before sending it to the frontend.

Example response:

```json
{
  "id": 12345,
  "title": "Heneral Luna",
  "releaseYear": 2015,
  "poster": "...",
  "genres": [
    "History",
    "Drama"
  ]
}
```

---

## 5. Frontend Displays Results

The frontend renders the search results without permanently storing the movie information.

```
User
    │
    ▼
Search Results
```

---

# Viewing Movie Details

When a user selects a movie:

```
Click Movie
      │
      ▼
Next.js
      │
      ▼
FastAPI
      │
      ▼
External Movie API
```

The backend requests the movie's complete information.

Example data returned:

- Title
- Synopsis
- Runtime
- Genres
- Cast
- Director
- Writers
- Production Company
- Trailer
- Posters
- Backdrops
- Streaming Availability
- Release Date
- Awards (if supported)

The formatted response is then returned to the frontend for display.

---

# User-Generated Content

Movie metadata remains external, while user interactions are stored in MongoDB.

Examples include:

- User accounts
- Ratings
- Reviews
- Watchlists
- Favorites
- Custom lists
- Followers
- Activity history

Instead of storing the complete movie information, these records reference the movie using its external ID.

Example:

```json
{
  "userId": "...",
  "movieId": 12345,
  "rating": 9
}
```

When displaying a user's ratings or watchlist, the application:

1. Retrieves the user's data from MongoDB.
2. Extracts the external movie IDs.
3. Fetches the latest movie information from the external API.
4. Combines both datasets before returning the final response.

---

# Overall Request Flow

```text
                User
                  │
                  ▼
          Next.js Frontend
                  │
                  ▼
          FastAPI Backend
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
External Movie API      MongoDB
(Movie Metadata)     (User Data Only)
        │                   │
        └─────────┬─────────┘
                  ▼
          Combined Response
                  │
                  ▼
             Next.js UI
                  │
                  ▼
                User
```

---

# Benefits of This Approach

- No need to maintain a massive movie database.
- Movie information stays up to date with the external provider.
- MongoDB remains lightweight by storing only application-specific data.
- User-generated content is separated from movie metadata.
- New movies become available automatically as soon as they appear in the external movie database.
- The architecture is scalable and allows changing data providers in the future with minimal changes to the application.