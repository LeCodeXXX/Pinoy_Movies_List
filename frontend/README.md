# Important implementation details

- The frontend uses the Next.js App Router. Routes are under `app/`, reusable UI is under `app/components/`, and page-level presentation is under `app/pages/`.
- API communication is centralized in `app/utils/api.ts`. It prefixes requests with `NEXT_PUBLIC_API_BASE_URL`, forwards abort signals, and automatically adds the bearer token stored under `pinoy-cinema-access-token`.
- Authentication stores the signed-in user under `pinoy-cinema-auth-user` and the access token under `pinoy-cinema-access-token`. Browser storage is accessed only from client components or effects to avoid server-rendering issues.
- Typed API clients are separated by domain in `app/services/`: authentication, movies, credits, movie preferences, and reviews. Request and response types are defined in `app/types/`.
- Movie lists and similar movies are deduplicated by movie ID in `app/services/movieApi.ts` before being rendered.
- React Query is configured in `app/providers.tsx` with a five-minute stale time, thirty-minute garbage-collection time, and one retry.
- Dynamic routes include `/movies/[id]`, `/genres/[genreId]`, `/people/[id]`, and `/companies/[id]`. The `/profile` route contains tracked movies, favorites, ratings, reviews, statistics, and profile settings.
- Movie preferences and reviews are saved with authenticated user IDs using `PUT` requests. Successful saves update local profile state immediately.
- Components performing asynchronous requests use `AbortController` cleanup to prevent updates after unmounting.
- Tailwind CSS is imported through `app/globals.css`; the UI uses a dark theme with red accents.
- `next.config.ts` allowlists remote images from `image.tmdb.org`, `i.ytimg.com`, and `www.themoviedb.org` for use with `next/image`.


## Configure the frontend

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

Start the frontend(run this after the backend):

```
npm run dev
```

Use your computer IP address

```
NEXT_PUBLIC_API_BASE_URL=http://[IP_ADDRESS]:8000
```