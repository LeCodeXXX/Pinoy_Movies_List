# Movie Data Retrieval & Storage Architecture

## Overview

The application follows a **hybrid architecture**, where movie information is retrieved from an external movie service while user-specific data is stored locally in MongoDB.

Instead of maintaining a complete movie database, the application treats the external movie API as the **source of truth** for movie metadata. MongoDB stores only the data that belongs to the application, such as user accounts, favorites, ratings, reviews, watch history, and aggregated movie statistics.

This approach significantly reduces storage requirements, keeps movie information up-to-date, and allows the application to focus on community-driven features rather than maintaining movie records.

---

# System Architecture

```text
                    User
                      │
                      ▼
             Next.js Frontend
                      │
                      ▼
              FastAPI Backend
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
      External Movie API     MongoDB
     (Movie Information)   (Application Data)
              │                  │
              └────────┬─────────┘
                       ▼
              Combined Response
                       │
                       ▼
                 Next.js Frontend
                       │
                       ▼
                     User
```

---

# External Movie API

The external movie API is responsible for providing all movie-related information.

The application **does not permanently store** this information inside MongoDB.

Examples of information retrieved from the external API include:

| Information | Description |
|------------|-------------|
| Movie Title | Official movie title |
| Original Title | Original language title |
| Poster Image | Movie poster URL |
| Backdrop Image | Background artwork |
| Synopsis | Movie description |
| Cast | Actors and actresses |
| Director | Director information |
| Writers | Screenwriters |
| Genres | Action, Drama, Comedy, etc. |
| Runtime | Movie duration |
| Release Date | Official release |
| Trailer | YouTube trailer |
| Production Companies | Studios |
| Languages | Spoken languages |
| Budget | Movie budget (if available) |
| Revenue | Box office revenue |
| Streaming Providers | Available streaming services (if supported) |
| Similar Movies | Recommended related movies |

Every time a user opens a movie page, the application retrieves the latest movie information from the external API.

---

# MongoDB Responsibilities

MongoDB stores only data that belongs to the application.

Movie metadata itself is **never considered the source of truth**.

Instead, MongoDB stores user interactions with movies.

---

# User Collection

The User collection stores authentication and profile information.

## Stored Information

| Field | Description |
|--------|-------------|
| _id | MongoDB ObjectId |
| username | Unique username |
| email | Login email |
| password_hash | Encrypted password |
| display_name | User's display name |
| profile_picture | Avatar URL |
| created_at | Account creation date |
| updated_at | Last profile update |
| is_verified | Email verification status |
| is_active | Account status |

Example:

```json
{
    "_id": "...",
    "username": "john_doe",
    "email": "john@gmail.com",
    "display_name": "John",
    "profile_picture": "...",
    "created_at": "...",
    "updated_at": "...",
    "is_verified": true
}
```

---

# Favorites Collection

Stores the movies a user has favorited.

## Stored Information

| Field | Description |
|--------|-------------|
| user_id | Owner of the favorite |
| movie_id | External movie ID |
| added_at | Date added |

Example:

```json
{
    "user_id": "...",
    "movie_id": 12345,
    "added_at": "2026-07-26"
}
```

The movie title and poster are **not stored**.

When displaying favorites:

1. Retrieve favorite movie IDs from MongoDB.
2. Request movie information from the external API.
3. Combine both datasets.

---

# Watch History Collection

Stores movies the user has watched.

## Stored Information

| Field | Description |
|--------|-------------|
| user_id | User |
| movie_id | External movie ID |
| watched_at | Watch date |

Example:

```json
{
    "user_id": "...",
    "movie_id": 12345,
    "watched_at": "2026-07-20"
}
```

---

# Ratings Collection

Stores ratings given by users.

## Stored Information

| Field | Description |
|--------|-------------|
| user_id | User |
| movie_id | External Movie ID |
| rating | User rating (1-10) |
| rated_at | Submission date |

Example:

```json
{
    "user_id": "...",
    "movie_id": 12345,
    "rating": 9,
    "rated_at": "2026-07-26"
}
```

---

# Reviews Collection

Stores written reviews.

## Stored Information

| Field | Description |
|--------|-------------|
| user_id | Author |
| movie_id | External Movie ID |
| review | Written review |
| created_at | Creation date |
| updated_at | Last edit |

Example:

```json
{
    "user_id": "...",
    "movie_id": 12345,
    "review": "One of the best Filipino historical films.",
    "created_at": "...",
    "updated_at": "..."
}
```

---

# Movie Statistics Collection

Unlike movie metadata, this collection stores **application-generated statistics**.

This allows movie pages to load community statistics instantly without scanning millions of user documents.

## Stored Information

| Field | Description |
|--------|-------------|
| movie_id | External Movie ID |
| title | Movie title (cached for convenience) |
| poster | Poster URL (cached) |
| average_rating | Average community rating |
| total_ratings | Number of ratings |
| total_reviews | Number of reviews |
| total_favorites | Number of users who favorited |
| total_watched | Number of users who watched |
| updated_at | Last statistics update |

Example:

```json
{
    "movie_id": 12345,
    "title": "Heneral Luna",
    "poster": "https://...",
    "average_rating": 9.1,
    "total_ratings": 1242,
    "total_reviews": 418,
    "total_favorites": 980,
    "total_watched": 3560,
    "updated_at": "2026-07-26"
}
```

These fields are **cached metadata**, not the authoritative movie record. They exist to improve performance and avoid repeatedly requesting basic display information from the external API when showing rankings, trending movies, or statistics.

---

# Retrieving a Movie Page

When a user opens a movie page:

```
User clicks movie
        │
        ▼
Next.js
        │
        ▼
FastAPI
```

FastAPI performs two requests simultaneously.

## Request 1

External Movie API

Returns:

- Title
- Poster
- Backdrop
- Synopsis
- Cast
- Director
- Runtime
- Genres
- Release Date
- Trailer
- Production Companies

---

## Request 2

MongoDB

Returns:

- Average rating
- Number of ratings
- Number of reviews
- Number of favorites
- Number watched
- Current user's rating (if any)
- Current user's review (if any)
- Is favorited?
- Has watched?

---

The backend combines both responses.

```
External API
      │
      ▼
 Movie Metadata
      │

MongoDB
      │
      ▼
User Interaction
      │

      ▼
Combined Response
      │
      ▼
Frontend
```

The frontend receives one complete object.

Example:

```json
{
    "movie": {
        "id": 12345,
        "title": "Heneral Luna",
        "poster": "...",
        "synopsis": "...",
        "cast": [
            "John Arcilla",
            "Mon Confiado"
        ]
    },
    "statistics": {
        "average_rating": 9.1,
        "favorites": 980,
        "watched": 3560
    },
    "user": {
        "favorite": true,
        "watched": true,
        "rating": 10,
        "review": "Amazing film."
    }
}
```

---

# Why Movie Metadata Is Not Stored

Movie information changes over time.

Examples include:

- New posters
- Updated cast lists
- Additional streaming providers
- Corrected synopsis
- New trailers
- Updated ratings
- Additional production information

Keeping this information locally would require constant synchronization.

Using an external movie provider ensures the application always displays the latest available information.

---

# Why User Data Is Stored

User-generated information belongs exclusively to the application.

Examples include:

- Authentication
- Favorites
- Ratings
- Reviews
- Watch history
- Community statistics

This information cannot be retrieved from external movie providers and represents the unique value of the application.

---

# Benefits of This Architecture

- Movie metadata remains current without manual synchronization.
- MongoDB stores only application-specific information, reducing storage requirements.
- Community statistics are precomputed for fast loading and ranking pages.
- User interactions remain independent of the external movie provider.
- The architecture scales efficiently as the number of users grows.
- Switching to a different movie provider in the future requires minimal database changes because all relationships are based on the external movie ID.