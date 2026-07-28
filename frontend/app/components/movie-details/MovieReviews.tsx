'use client'

import { useRef } from 'react'
import type { MovieReview } from '@/app/dummy/movieReviewsData'

export default function MovieReviews({ reviews }: { reviews: MovieReview[] }) {
  if (reviews.length === 0) {
    return (
      <section className="mt-6 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
        <h2 className="text-lg font-extrabold text-white">Community reviews</h2>
        <p className="mt-2 text-sm text-zinc-500">
          No local review fixtures are available for this movie yet.
        </p>
      </section>
    )
  }

  const aboveAverage = reviews.slice(0, 5)
  const belowAverage = reviews.slice(5, 10)

  return (
    <section className="mt-6 pb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
        Local fixture data
      </p>
      <h2 className="mt-1 text-2xl font-extrabold text-white">
        Community reviews
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Reviews remain local until the application review API is available.
      </p>

      <div className="mt-6 space-y-12">
        <ReviewGroup accent="positive" reviews={aboveAverage} title="Above average" />
        <ReviewGroup accent="critical" reviews={belowAverage} title="Below average" />
      </div>
    </section>
  )
}

function ReviewGroup({
  title,
  reviews,
  accent,
}: {
  title: string
  reviews: MovieReview[]
  accent: 'positive' | 'critical'
}) {
  const isPositive = accent === 'positive'
  const viewportRef = useRef<HTMLDivElement>(null)

  const scrollReviews = (direction: -1 | 1) => {
    const viewport = viewportRef.current
    if (!viewport) return

    const firstCard = viewport.querySelector<HTMLElement>('[data-review-card]')
    const gap = Number.parseFloat(window.getComputedStyle(viewport).rowGap) || 16
    const distance = (firstCard?.offsetHeight ?? 176) + gap

    viewport.scrollBy({ behavior: 'smooth', top: direction * distance })
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            <svg
              aria-hidden="true"
              className={`h-3.5 w-3.5 ${isPositive ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 19V5m0 0l-5 5m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-1 text-[10px] text-zinc-600">
            {reviews.length} reviews · 3 visible
          </span>
          <button
            aria-label={`Show previous ${title.toLowerCase()} review`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:opacity-30"
            disabled={reviews.length <= 3}
            onClick={() => scrollReviews(-1)}
            type="button"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
          <button
            aria-label={`Show next ${title.toLowerCase()} review`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition hover:border-zinc-700 hover:text-white disabled:opacity-30"
            disabled={reviews.length <= 3}
            onClick={() => scrollReviews(1)}
            type="button"
          >
            <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M18 9l-6 6-6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="scrollbar-hidden h-[35rem] snap-y snap-mandatory space-y-4 overflow-y-auto pr-1"
        ref={viewportRef}
      >
        {reviews.map((review) => (
          <div className="h-44 snap-start" data-review-card key={review.id}>
            <ReviewCard accent={accent} review={review} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({
  review,
  accent,
}: {
  review: MovieReview
  accent: 'positive' | 'critical'
}) {
  const reviewDate = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
  }).format(new Date(review.reviewed_at))

  return (
    <article className="flex h-full flex-col rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
              accent === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-red-500/10 text-red-400'
            }`}
          >
            {getInitials(review.author)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-zinc-200">{review.author}</p>
            <p className="mt-0.5 text-[10px] text-zinc-600">{reviewDate}</p>
          </div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1 text-xs font-black ${
            accent === 'positive'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          ★ {review.rating}
        </span>
      </div>
      <h4 className="mt-3 line-clamp-1 text-sm font-extrabold text-white">{review.title}</h4>
      <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-zinc-400">{review.content}</p>
      <p className="mt-auto border-t border-zinc-800/80 pt-3 text-[10px] text-zinc-600">
        {review.helpful_count} viewers found this helpful
      </p>
    </article>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}
