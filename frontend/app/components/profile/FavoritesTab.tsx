'use client'

import MovieCard from '@/app/components/MovieCard'
import type { MovieSummary } from '@/app/types/movie'

interface FavoritesTabProps {
  movies: MovieSummary[]
  onRemoveFavorite?: (movieId: number) => void
}

export default function FavoritesTab({
  movies,
  onRemoveFavorite,
}: FavoritesTabProps) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-950/20 text-red-400">
          <HeartOutlineIcon />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No Favorite Movies Yet</h3>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
          Explore Pinoy cinema and click the heart icon on any movie to build your personal vault.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Favorited Movies ({movies.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <MovieCard movie={movie} />
            {onRemoveFavorite ? (
              <button
                aria-label={`Remove ${movie.title} from favorites`}
                className="absolute right-2 top-2 z-10 hidden rounded-full bg-black/80 p-1.5 text-zinc-400 transition hover:bg-red-600 hover:text-white group-hover:block"
                onClick={(e) => {
                  e.preventDefault()
                  onRemoveFavorite(movie.id)
                }}
                title="Remove from favorites"
                type="button"
              >
                <TrashIcon />
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function HeartOutlineIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
