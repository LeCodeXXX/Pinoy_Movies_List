'use client'

import Link from 'next/link'
import type { MovieSummary } from '@/app/types/movie'

export interface RatedMovieItem {
  movie: MovieSummary
  rated_at: string
  rating: number
}

interface RatingsTabProps {
  ratings: RatedMovieItem[]
}

export default function RatingsTab({ ratings }: RatingsTabProps) {
  if (ratings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center sm:rounded-3xl sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-950/20 text-red-400">
          <StarIcon />
        </div>
        <h3 className="mt-4 text-base font-bold text-white sm:text-lg">No Ratings Submitted</h3>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
          Rate movies from 1 to 10 to share your score with the Pinoy Cinema community.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-white sm:text-lg">
        My Ratings ({ratings.length})
      </h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ratings.map(({ movie, rated_at, rating }) => (
          <Link
            key={movie.id}
            className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-2.5 transition hover:border-zinc-700 hover:bg-zinc-900 sm:gap-4 sm:rounded-2xl sm:p-3"
            href={`/movies/${movie.id}`}
          >
            <img
              alt={movie.title}
              className="h-20 w-14 shrink-0 rounded-xl object-cover bg-zinc-900"
              src={movie.poster_url ?? undefined}
            />
            <div className="flex flex-col justify-between py-0.5 min-w-0">
              <div>
                <h3 className="truncate text-sm font-bold text-white">
                  {movie.title}
                </h3>
                <p className="text-[11px] text-zinc-400">
                  {movie.release_date?.slice(0, 4) ?? 'TBA'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-lg bg-red-950/80 border border-red-500/30 px-2 py-0.5 text-xs font-black text-red-300">
                  <StarIcon />
                  {rating}/10
                </span>
                <span className="text-[10px] text-zinc-500">{rated_at}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StarIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}
