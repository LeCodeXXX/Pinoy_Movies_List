'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { MovieReview } from '@/app/types/movieReview'

interface ReviewsTabProps {
  reviews: MovieReview[]
}

export default function ReviewsTab({ reviews }: ReviewsTabProps) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-950/40 p-6 text-center sm:rounded-3xl sm:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/20 bg-red-950/20 text-red-400">
          <MessageIcon />
        </div>
        <h3 className="mt-4 text-base font-bold text-white sm:text-lg">No Reviews Authored</h3>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
          Share your thoughts and reviews on movies you have watched.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold text-white sm:text-lg">
        My Reviews ({reviews.length})
      </h2>

      <div className="space-y-3">
        {reviews.map(({ id, movie, rating, review, updated_at }) => (
          <article
            key={id}
            className="flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 transition sm:flex-row sm:items-start sm:gap-4 sm:rounded-2xl sm:p-4"
          >
            <Link className="relative h-24 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-900" href={`/movies/${movie.id}`}>
              {movie.poster_url ? (
                <Image
                  alt={`${movie.title} poster`}
                  className="object-cover"
                  fill
                  sizes="64px"
                  src={movie.poster_url}
                />
              ) : null}
            </Link>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  className="font-bold text-white hover:text-red-400"
                  href={`/movies/${movie.id}`}
                >
                  {movie.title}
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-blue-300">
                    {rating} / 10
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500">
                    {formatReviewDate(updated_at)}
                  </span>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-zinc-300 italic">
                &ldquo;{review}&rdquo;
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(
    new Date(value),
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
