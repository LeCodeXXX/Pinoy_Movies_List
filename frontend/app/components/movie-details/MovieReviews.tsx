'use client'

import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  getMovieReviews,
  getUserMovieReview,
  saveMovieReview,
} from '@/app/services/movieReviewApi'
import type { AuthUser } from '@/app/types/auth'
import type { MovieDetail } from '@/app/types/movie'
import type { MovieReview } from '@/app/types/movieReview'

const MAX_REVIEW_LENGTH = 5_000

export default function MovieReviews({
  movie,
  user,
}: {
  movie: MovieDetail
  user: AuthUser | null
}) {
  const [reviews, setReviews] = useState<MovieReview[]>([])
  const [rating, setRating] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  const [hasExistingReview, setHasExistingReview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    getMovieReviews(movie.id, controller.signal)
      .then((response) => setReviews(response.results))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : 'Unable to load reviews.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [movie.id])

  useEffect(() => {
    if (!user) return

    const controller = new AbortController()
    getUserMovieReview(user.id, movie.id, controller.signal)
      .then((existingReview) => {
        if (!existingReview) return
        setRating(existingReview.rating)
        setComment(existingReview.review)
        setHasExistingReview(true)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setMessage(error instanceof Error ? error.message : 'Unable to load your review.')
        }
      })

    return () => controller.abort()
  }, [movie.id, user])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) {
      setMessage('Sign in first to review this movie.')
      return
    }
    if (rating === null) {
      setMessage('Choose a rating before writing your review.')
      return
    }
    const normalizedComment = comment.trim()
    if (!normalizedComment) {
      setMessage('Write a comment before submitting your review.')
      return
    }

    setIsSubmitting(true)
    setMessage(null)
    try {
      const savedReview = await saveMovieReview(user.id, movie.id, {
        rating,
        review: normalizedComment,
      })
      setComment(savedReview.review)
      setHasExistingReview(true)
      setReviews((current) => [
        savedReview,
        ...current.filter((review) => review.id !== savedReview.id),
      ])
      setMessage('Your review has been saved and added to your profile.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save your review.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mt-6 pb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
        From movie fans
      </p>
      <h2 className="mt-1 text-2xl font-extrabold text-white">Community reviews</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Rate the movie first, then share what stood out to you.
      </p>

      <form
        className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-white">
              {hasExistingReview ? 'Update your review' : 'Write a review'}
            </h3>
            <p className="mt-1 text-xs text-zinc-500">
              {user ? `Posting as ${user.display_name}` : 'Sign in to share a review.'}
            </p>
          </div>
          {rating !== null ? (
            <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm font-black text-amber-300">
              &#9733; {rating} / 10
            </span>
          ) : null}
        </div>

        <fieldset className="mt-5" disabled={!user || isSubmitting}>
          <legend className="text-xs font-bold text-zinc-300">
            1. Choose your rating <span className="text-red-400">*</span>
          </legend>
          <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: 10 }, (_, index) => index + 1).map((score) => (
              <button
                aria-label={`Rate ${score} out of 10`}
                aria-pressed={rating === score}
                className={`rounded-xl border px-2 py-2.5 text-xs font-black transition ${
                  rating === score
                    ? 'border-amber-400 bg-amber-400 text-zinc-950'
                    : 'border-zinc-700 bg-zinc-950 text-zinc-400 hover:border-amber-500/60 hover:text-amber-300'
                }`}
                key={score}
                onClick={() => {
                  setRating(score)
                  setMessage(null)
                }}
                type="button"
              >
                {score}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="mt-5 block text-xs font-bold text-zinc-300" htmlFor="movie-review-comment">
          2. Share your thoughts <span className="text-red-400">*</span>
        </label>
        <textarea
          className="mt-3 min-h-32 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-45"
          disabled={!user || rating === null || isSubmitting}
          id="movie-review-comment"
          maxLength={MAX_REVIEW_LENGTH}
          onChange={(event) => {
            setComment(event.target.value)
            setMessage(null)
          }}
          placeholder={rating === null ? 'Choose a rating to unlock your comment.' : 'What did you think about this movie?'}
          required
          value={comment}
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] text-zinc-600">
            {comment.length.toLocaleString()} / {MAX_REVIEW_LENGTH.toLocaleString()}
          </p>
          <button
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!user || rating === null || !comment.trim() || isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Saving...' : hasExistingReview ? 'Update review' : 'Post review'}
          </button>
        </div>
        {message ? (
          <p className="mt-3 text-xs font-medium text-zinc-400" role="status">
            {message}
          </p>
        ) : null}
      </form>

      <div className="mt-8">
        <h3 className="text-sm font-bold text-zinc-200">
          Latest reviews {!isLoading ? `(${reviews.length})` : ''}
        </h3>
        {isLoading ? (
          <p className="mt-4 text-xs text-zinc-500">Loading community reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
            <p className="text-sm font-bold text-white">No reviews yet</p>
            <p className="mt-1 text-xs text-zinc-500">Be the first to share your thoughts.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function ReviewCard({ review }: { review: MovieReview }) {
  const reviewDate = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' }).format(
    new Date(review.updated_at),
  )
  const authorName = review.author.display_name || review.author.username

  return (
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-xs font-black text-red-300">
            {getInitials(authorName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-zinc-200">{authorName}</p>
            <p className="mt-0.5 text-[10px] text-zinc-600">{reviewDate}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs font-black text-amber-300">
          &#9733; {review.rating}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap text-xs leading-6 text-zinc-300">{review.review}</p>
    </article>
  )
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
