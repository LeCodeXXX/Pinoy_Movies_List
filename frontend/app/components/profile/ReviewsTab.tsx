'use client'

import Link from 'next/link'
import type { MovieSummary } from '@/app/types/movie'

export interface UserReviewItem {
  created_at: string
  id: string
  movie: MovieSummary
  review: string
}

interface ReviewsTabProps {
  reviews: UserReviewItem[]
}

export default function ReviewsTab({ reviews }: ReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/40 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-950/20 text-red-400">
          <MessageIcon />
        </div>
        <h3 className="mt-4 text-lg font-bold text-white">No Reviews Authored</h3>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
          Share your thoughts and reviews on movies you have watched.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white">
        My Reviews ({reviews.length})
      </h2>

      <div className="space-y-3">
        {reviews.map(({ created_at, id, movie, review }) => (
          <article
            key={id}
            className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition sm:flex-row sm:items-start"
          >
            <Link className="shrink-0" href={`/movies/${movie.id}`}>
              <img
                alt={movie.title}
                className="h-24 w-16 rounded-xl object-cover bg-zinc-900"
                src={movie.poster_url ?? undefined}
              />
            </Link>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  className="font-bold text-white hover:text-red-400"
                  href={`/movies/${movie.id}`}
                >
                  {movie.title}
                </Link>
                <span className="text-[11px] font-medium text-zinc-500">
                  {created_at}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-300">
                &ldquo;{review}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function MessageIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
