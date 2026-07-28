# TMDB Integration

The application uses **The Movie Database (TMDB)** as the primary
provider of movie information.

TMDB serves as the application's **authoritative source for movie
metadata**. Movie information is requested from TMDB whenever needed
instead of being permanently stored in MongoDB.

Only application-specific data is stored locally.

------------------------------------------------------------------------

# Updated System Architecture

``` text
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
             TMDB             MongoDB
     (Movie Metadata API)  (Application Data)
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

------------------------------------------------------------------------

# Information Retrieved from TMDB

  Information            Description
  ---------------------- ------------------------------------------
  Movie Title            Official movie title
  Original Title         Original language title
  Poster Image           Poster URL
  Backdrop Image         Background artwork
  Synopsis               Movie overview
  Cast                   Actors and actresses
  Crew                   Directors, writers, producers
  Genres                 Action, Drama, Comedy, etc.
  Runtime                Movie duration
  Release Date           Official release date
  Trailer                YouTube trailers
  Production Companies   Production studios
  Spoken Languages       Available languages
  Budget                 Production budget (if available)
  Revenue                Box office revenue
  Watch Providers        Streaming providers available by country
  Similar Movies         Related movie recommendations
  External IDs           IMDb ID and other external identifiers

------------------------------------------------------------------------

# Movie Metadata Retrieval Flow

When a movie page is requested, FastAPI retrieves movie metadata from
TMDB.

To minimize network requests, related resources are requested using
TMDB's `append_to_response` feature whenever possible.

Example:

``` http
GET /movie/{movie_id}?append_to_response=credits,videos,recommendations,external_ids
```

If watch providers are required, the backend performs an additional TMDB
request because provider information is country-specific (for example,
`PH`).

------------------------------------------------------------------------

# Caching TMDB Responses

Although TMDB is the source of truth for movie metadata, the backend may
temporarily cache API responses to improve performance and reduce
unnecessary requests.

  Data              Suggested Cache Duration
  ----------------- --------------------------
  Movie Details     6--24 hours
  Search Results    15--60 minutes
  Trending Movies   15--30 minutes
  Watch Providers   6--24 hours

The cache is **not** considered the source of truth. Once expired, fresh
data is retrieved from TMDB.

------------------------------------------------------------------------

# Why TMDB Instead of Storing Movies Locally

Using TMDB provides several advantages:

-   Movie information stays current without manual synchronization.
-   Storage requirements remain low because movie metadata is not
    duplicated.
-   New posters, trailers, and production details become available
    automatically.
-   Switching to another provider in the future requires minimal changes
    because MongoDB stores only provider IDs and user-generated data.

MongoDB continues to store only application-specific information such as
authentication, favorites, ratings, reviews, watch history, and
community statistics.
