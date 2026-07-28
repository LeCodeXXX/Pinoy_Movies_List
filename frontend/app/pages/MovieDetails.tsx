'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import MovieReviews from '@/app/components/movie-details/MovieReviews'
import {
  getMovieReviews,
  type MovieReview,
} from '@/app/dummy/movieReviewsData'
import { getMovie } from '@/app/services/movieApi'
import type { MovieDetail } from '@/app/types/movie'

export default function MovieDetails() {
  const params = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [requestError, setRequestError] = useState<{
    movieId: number
    message: string
  } | null>(null)
  const movieId = Number(params.id)
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0

  useEffect(() => {
    if (!isValidMovieId) return

    const controller = new AbortController()
    getMovie(movieId, controller.signal)
      .then((response) => {
        setMovie(response)
        setRequestError(null)
      })
      .catch((requestError: unknown) => {
        if (controller.signal.aborted) return
        setRequestError({
          movieId,
          message:
            requestError instanceof Error
              ? requestError.message
              : 'Unable to load this movie.',
        })
      })

    return () => controller.abort()
  }, [isValidMovieId, movieId])

  if (!isValidMovieId) {
    return <MovieDetailsError message="This movie ID is invalid." />
  }
  if (requestError?.movieId === movieId) {
    return <MovieDetailsError message={requestError.message} />
  }
  if (movie?.id !== movieId) return <MovieDetailsSkeleton />

  const reviews = getMovieReviews(movie.id)
  const releaseDate = movie.release_date
    ? new Intl.DateTimeFormat('en-PH', { dateStyle: 'long' }).format(
      new Date(movie.release_date),
    )
    : 'Not announced'
  const providers = getUniqueProviderNames(movie)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-500 selection:text-white">
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav className="mb-6">
          <Link
            className="group inline-flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 shadow-lg shadow-red-950/20 transition hover:border-red-400 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            href="/"
          >
            <span
              aria-hidden="true"
              className="text-lg leading-none transition-transform group-hover:-translate-x-1"
            >
              ←
            </span>
            Back to movies
          </Link>
        </nav>

        <MovieHero movie={movie} />

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <h2 className="text-xl font-extrabold text-white">Overview</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                {movie.synopsis || 'TMDB does not have a synopsis for this movie.'}
              </p>
            </section>

            <CastSection movie={movie} />

            <TrailerSection movie={movie} />

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-white">Production</h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <DetailBlock
                  label="Director"
                  values={movie.director ? [movie.director.name] : []}
                />
                <DetailBlock
                  label="Writers"
                  values={movie.writers.map((writer) => writer.name)}
                />
                <DetailBlock
                  label="Production companies"
                  values={movie.production_companies.map((company) => company.name)}
                />
                <DetailBlock
                  label="Spoken languages"
                  values={movie.spoken_languages.map((language) => language.name)}
                />
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl shadow-black/20">
            <h2 className="text-base font-extrabold text-white">Movie information</h2>
            <dl className="mt-4 divide-y divide-zinc-800">
              <DetailRow label="Release date" value={releaseDate} />
              <DetailRow label="Runtime" value={formatRuntime(movie.runtime)} />
              <DetailRow label="Status" value={movie.status ?? 'Unknown'} />
              <DetailRow label="Original language" value={movie.original_language.toUpperCase()} />
              <DetailRow label="Budget" value={formatMoney(movie.budget)} />
              <DetailRow label="Revenue" value={formatMoney(movie.revenue)} />
              <DetailRow label="Popularity" value={movie.popularity.toFixed(1)} />
              <DetailRow
                label="Watch providers"
                value={providers.length ? providers.join(', ') : 'None listed for PH'}
              />
            </dl>
          </aside>
        </div>

        <RatingDistribution movie={movie} reviews={reviews} />
        <MovieReviews reviews={reviews} />
        <SimilarMovies movie={movie} />
      </main>
    </div>
  )
}

function MovieHero({ movie }: { movie: MovieDetail }) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40">
      {movie.backdrop_url ? (
        <Image alt="" className="object-cover opacity-25" fill priority sizes="100vw" src={movie.backdrop_url} />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/45" />
      <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:p-10">
        <div className="relative mx-auto aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-800 shadow-2xl md:mx-0">
          {movie.poster_url ? (
            <Image alt={`${movie.title} poster`} className="object-cover" fill priority sizes="220px" src={movie.poster_url} />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <div className="flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span key={genre.id} className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-300">
                {genre.name}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">{movie.title}</h1>
          {movie.tagline ? <p className="mt-2 text-lg italic text-zinc-400">“{movie.tagline}”</p> : null}
          <p className="mt-4 text-sm text-zinc-400">{movie.original_title} · {movie.release_date?.slice(0, 4) ?? 'TBA'}</p>
          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-400">
            <span className="text-xl">★</span>
            <span className="text-2xl font-black">{movie.tmdb_vote_average.toFixed(1)}</span>
            <span className="text-xs text-zinc-500">/ 10 · {movie.tmdb_vote_count.toLocaleString()} votes</span>
          </div>
        </div>
      </div>
    </section>
  )
}

function CastSection({ movie }: { movie: MovieDetail }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <h2 className="text-xl font-extrabold text-white">Top cast</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {movie.cast.slice(0, 8).map((member) => (
          <article key={member.id} className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-zinc-800">
              {member.profile_url ? <Image alt="" className="object-cover" fill sizes="44px" src={member.profile_url} /> : null}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-zinc-200">{member.name}</h3>
              <p className="mt-0.5 truncate text-[11px] text-zinc-500">{member.character || 'Cast member'}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function TrailerSection({ movie }: { movie: MovieDetail }) {
  if (!movie.trailer) return null

  const trailer = movie.trailer
  const thumbnailUrl = `https://i.ytimg.com/vi/${encodeURIComponent(trailer.youtube_key)}/hqdefault.jpg`

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="mt-1 text-xl font-extrabold text-white">Trailer</h2>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Opens on YouTube
        </span>
      </div>

      <a
        aria-label={`Watch ${trailer.name} for ${movie.title} on YouTube`}
        className="group relative block aspect-video overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/30 transition hover:border-red-500/60"
        href={trailer.url}
        rel="noreferrer"
        target="_blank"
      >
        <Image
          alt={`${movie.title} trailer thumbnail`}
          className="object-cover transition duration-500 group-hover:scale-105"
          fill
          sizes="(max-width: 1024px) 100vw, 800px"
          src={thumbnailUrl}
        />
        <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />

        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-red-600 text-white shadow-2xl transition group-hover:scale-110 group-hover:bg-red-500 sm:h-20 sm:w-20">
          <svg
            aria-hidden="true"
            className="ml-1 h-7 w-7 fill-current sm:h-9 sm:w-9"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <p className="line-clamp-1 text-sm font-extrabold text-white sm:text-base">
            {trailer.name}
          </p>
          <p className="mt-1 text-xs text-zinc-300">Click to watch on YouTube</p>
        </div>
      </a>
    </section>
  )
}

function RatingDistribution({
  movie,
  reviews,
}: {
  movie: MovieDetail
  reviews: MovieReview[]
}) {
  const averageRating = Math.min(10, Math.max(0, movie.tmdb_vote_average))
  const totalReviewRatings = reviews.length
  const ratingCounts = Array.from({ length: 10 }, (_, index) => {
    const rating = index + 1
    return {
      count: reviews.filter((review) => Math.round(review.rating) === rating)
        .length,
      rating,
    }
  })
  const maximumCount = Math.max(...ratingCounts.map(({ count }) => count), 1)

  return (
    <section className="mt-6 rounded-2xl border border-emerald-500/15 bg-zinc-900/60 p-5 sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Local review data
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">
            Rating distribution
          </h2>
        </div>
        <p className="shrink-0 text-right">
          <span className="text-4xl font-black leading-none text-emerald-400 sm:text-5xl">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-sm font-bold text-zinc-500"> / 10</span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
            Average rating
          </span>
        </p>
      </div>

      {totalReviewRatings > 0 ? (
        <div
          aria-label="Vertical review rating distribution from 1 to 10"
          className="mt-7 grid h-64 grid-cols-10 items-end gap-1 border-b border-zinc-700"
          role="img"
        >
          {ratingCounts.map(({ count, rating }) => {
            const percentage = (count / totalReviewRatings) * 100
            const chartHeight = (count / maximumCount) * 100

            return (
              <div className="flex h-full flex-col items-center justify-end" key={rating}>
                <span className="mb-2 text-[9px] tabular-nums text-zinc-500 sm:text-[10px]">
                  {percentage.toFixed(0)}%
                </span>
                <div className="flex h-48 w-full items-end overflow-hidden rounded-t-sm bg-zinc-800/80">
                  <div
                    className="w-full rounded-t-sm bg-emerald-500 shadow-[0_-4px_16px_rgba(16,185,129,0.25)]"
                    style={{ height: `${chartHeight}%` }}
                  />
                </div>
                <span className="mt-2 text-[10px] font-bold text-zinc-400">
                  {rating}
                </span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-800 p-8 text-center text-sm text-zinc-500">
          No local review ratings are available for this distribution.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>Distribution based on {totalReviewRatings} local reviews</span>
        <span className="font-semibold text-zinc-400">
          {movie.tmdb_vote_count.toLocaleString()} people rated this movie
        </span>
      </div>
    </section>
  )
}

function SimilarMovies({ movie }: { movie: MovieDetail }) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scrollMovies = (direction: -1 | 1) => {
    const row = rowRef.current
    if (!row) return

    const firstCard = row.querySelector<HTMLElement>('[data-similar-card]')
    const gap = Number.parseFloat(window.getComputedStyle(row).columnGap) || 12
    const distance = (firstCard?.offsetWidth ?? 112) + gap

    row.scrollBy({ behavior: 'smooth', left: direction * distance })
  }

  if (!movie.similar_movies.length) return null

  return (
    <section className="mt-12 border-t border-zinc-800 pb-10 pt-10">
      <h2 className="text-xl font-extrabold text-white">Similar movies</h2>
      <div className="relative mt-5 px-6">
        <div
          className="scrollbar-hidden flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
          ref={rowRef}
        >
          {movie.similar_movies.map((similar) => (
            <Link
              className="w-28 shrink-0 snap-start"
              data-similar-card
              href={`/movies/${similar.id}`}
              key={similar.id}
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
                {similar.poster_url ? (
                  <Image
                    alt={`${similar.title} poster`}
                    className="object-cover"
                    fill
                    sizes="112px"
                    src={similar.poster_url}
                  />
                ) : null}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-bold text-zinc-300">
                {similar.title}
              </p>
            </Link>
          ))}
        </div>

        <button
          aria-label="Show previous similar movie"
          className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-950/95 text-white shadow-xl shadow-black/60 transition hover:scale-110 hover:border-red-400 hover:bg-red-600 disabled:opacity-30"
          disabled={movie.similar_movies.length <= 1}
          onClick={() => scrollMovies(-1)}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
          </svg>
        </button>
        <button
          aria-label="Show next similar movie"
          className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-950/95 text-white shadow-xl shadow-black/60 transition hover:scale-110 hover:border-red-400 hover:bg-red-600 disabled:opacity-30"
          disabled={movie.similar_movies.length <= 1}
          onClick={() => scrollMovies(1)}
          type="button"
        >
          <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} />
          </svg>
        </button>
      </div>
    </section>
  )
}

function DetailBlock({ label, values }: { label: string; values: string[] }) {
  return <div><h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</h3><p className="mt-1 text-sm leading-6 text-zinc-300">{values.length ? values.join(', ') : 'Not provided'}</p></div>
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-xs"><dt className="text-zinc-500">{label}</dt><dd className="max-w-[180px] text-right font-medium text-zinc-200">{value}</dd></div>
}

function MovieDetailsSkeleton() {
  return <div className="min-h-screen bg-zinc-950 p-6"><div className="mx-auto h-[520px] max-w-7xl animate-pulse rounded-3xl bg-zinc-900" /></div>
}

function MovieDetailsError({ message }: { message: string | null }) {
  return <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center"><div><h1 className="text-2xl font-black text-white">Movie unavailable</h1><p className="mt-2 text-sm text-zinc-500">{message ?? 'The movie could not be loaded.'}</p><Link className="mt-5 inline-block rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white" href="/">Back to movies</Link></div></div>
}

function formatRuntime(runtime: number | null) {
  if (!runtime) return 'Not provided'
  return `${Math.floor(runtime / 60)}h ${runtime % 60}m`
}

function formatMoney(value: number) {
  return value > 0 ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) : 'Not disclosed'
}

function getUniqueProviderNames(movie: MovieDetail) {
  const availability = movie.streaming_availability
  return Array.from(new Set([...availability.streaming, ...availability.free, ...availability.ads, ...availability.rent, ...availability.buy].map((provider) => provider.name)))
}
