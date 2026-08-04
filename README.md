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

## Future features

The following features are planned for future releases:

- **Community discussions:** Add a community area where users can publish movie-related articles, reviews, recommendations, and discussion posts.
- **Discussion threads:** Allow users to open threads for individual movies or broader cinema topics, with replies and nested conversations similar to Reddit or MyAnimeList.
- **Community interactions:** Add upvotes or reactions, comment sorting, post discovery, user profiles, and moderation tools for reporting or removing inappropriate content.
- **Movie-linked discussions:** Connect community posts and threads to movie pages so users can easily join conversations about a specific film.
- **Additional OAuth providers:** Support sign-in through providers such as Google, GitHub, Facebook, or Apple alongside the existing JWT authentication flow.
- **OAuth account linking:** Allow users to connect multiple login providers to one Pinoy Cinema Vault account without losing their saved movies, ratings, favorites, or reviews.

