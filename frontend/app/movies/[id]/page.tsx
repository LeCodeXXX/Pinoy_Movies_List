import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  movieDetailIds,
  movieDetailsApiResponses,
  type MovieReview,
} from '../../dummy/movieDetailsData'

interface MovieDetailsPageProps {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return movieDetailIds.map((id) => ({ id }))
}

export async function generateMetadata({
  params,
}: MovieDetailsPageProps): Promise<Metadata> {
  const { id } = await params
  const response = movieDetailsApiResponses[id]

  if (!response) {
    return { title: 'Movie not found | Pinoy Cinema Vault' }
  }

  return {
    title: `${response.data.title} | Pinoy Cinema Vault`,
    description: response.data.overview,
  }
}

export default async function MovieDetailsPage({
  params,
}: MovieDetailsPageProps) {
  const { id } = await params
  const apiResponse = movieDetailsApiResponses[id]

  if (!apiResponse?.success) {
    notFound()
  }

  const movie = apiResponse.data
  const releaseDate = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'long',
  }).format(new Date(movie.release_date))
  const ratingDistribution = [...movie.rating_distribution].sort(
    (first, second) => first.score - second.score,
  )
  const highestRatingPercentage = Math.max(
    ...ratingDistribution.map((bucket) => bucket.percentage),
  )
  const aboveAverageReviews = movie.reviews
    .filter((review) => review.rating >= movie.rating)
    .slice(0, 5)
  const belowAverageReviews = movie.reviews
    .filter((review) => review.rating < movie.rating)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-red-500 selection:text-white">
      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <nav className="mb-5 flex items-center justify-between gap-4">
          <Link
            className="group inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
            href="/"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 19l-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Back to movies
          </Link>

          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {apiResponse.message}
          </span>
        </nav>

        <section className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/40">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${movie.backdrop_color}`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_40%)]" />

          <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 lg:p-10">
            <div
              className={`relative mx-auto aspect-[2/3] w-full max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${movie.poster_color} shadow-2xl shadow-black/50 md:mx-0`}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_48%)]" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-16">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Filipino cinema
                </p>
                <p className="mt-1 text-xl font-black leading-tight text-white">
                  {movie.title}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-semibold text-red-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {movie.title}
              </h1>
              <p className="mt-2 text-lg font-medium italic text-zinc-400">
                “{movie.tagline}”
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-300">
                <span>{movie.release_year}</span>
                <span className="text-zinc-600">•</span>
                <span>{formatRuntime(movie.runtime_minutes)}</span>
                <span className="text-zinc-600">•</span>
                <span>{movie.content_rating}</span>
                <span className="text-zinc-600">•</span>
                <span>{movie.original_language}</span>
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
                {movie.overview}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-emerald-400 backdrop-blur-md">
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-black">{movie.rating}</span>
                  <span className="text-[10px] text-zinc-500">
                    {movie.vote_count.toLocaleString()} votes
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-black/30 px-3 py-2 text-xs text-zinc-300 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {movie.availability.quality} available
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                Featured performers
              </p>
              <h2 className="mt-1 text-xl font-extrabold text-white">Cast</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {movie.cast.map((castMember) => (
                  <article
                    key={castMember.id}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-950 text-xs font-black text-white">
                      {getInitials(castMember.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-zinc-200">
                        {castMember.name}
                      </h3>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-500">
                        as {castMember.character}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <h2 className="text-lg font-extrabold text-white">
                Production
              </h2>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <DetailBlock label="Director" values={[movie.director]} />
                <DetailBlock label="Writers" values={movie.writers} />
                <DetailBlock
                  label="Production companies"
                  values={movie.production_companies}
                />
                <DetailBlock
                  label="Subtitles"
                  values={movie.availability.subtitles}
                />
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-xl shadow-black/20">
            <h2 className="text-base font-extrabold text-white">
              Movie information
            </h2>
            <dl className="mt-4 divide-y divide-zinc-800">
              <DetailRow label="Release date" value={releaseDate} />
              <DetailRow
                label="Runtime"
                value={formatRuntime(movie.runtime_minutes)}
              />
              <DetailRow label="Country" value={movie.country} />
              <DetailRow label="Language" value={movie.original_language} />
              <DetailRow label="Age rating" value={movie.content_rating} />
              <DetailRow
                label="Popularity"
                value={`${movie.popularity.toFixed(1)} / 100`}
              />
              <DetailRow
                label="Availability"
                value={movie.availability.status}
              />
            </dl>

            <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
                Data source
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                Rendered from a dummy backend response using the production API
                response shape.
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                Audience score
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-white">
                Rating breakdown
              </h2>
              <p className="mt-1 text-xs text-zinc-500">
                Distribution of all {movie.vote_count.toLocaleString()} viewer
                ratings.
              </p>
            </div>
            <div className="flex items-center gap-2 sm:text-right">
              <svg
                aria-hidden="true"
                className="h-7 w-7 fill-emerald-400 text-emerald-400"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div>
                <span className="text-3xl font-black text-white">
                  {movie.rating}
                </span>
                <span className="text-sm text-zinc-500"> / 10</span>
              </div>
            </div>
          </div>

          <div
            aria-label={`Rating distribution for ${movie.title}`}
            className="mt-7 grid grid-cols-10 gap-1.5 sm:gap-3"
            role="img"
          >
            {ratingDistribution.map((bucket) => (
              <div key={bucket.score} className="min-w-0 text-center">
                <div className="flex h-40 items-end justify-center rounded-t-lg bg-zinc-950/50 px-0.5 sm:px-1">
                  <div
                    aria-label={`${bucket.score} out of 10: ${bucket.count.toLocaleString()} votes, ${bucket.percentage}%`}
                    className={`group relative w-full rounded-t-md bg-gradient-to-t transition ${
                      bucket.score >= movie.rating
                        ? 'from-emerald-700 to-emerald-300 hover:from-emerald-600 hover:to-emerald-200'
                        : 'from-red-800 to-red-400 hover:from-red-700 hover:to-red-300'
                    }`}
                    style={{
                      height: `${Math.max(
                        5,
                        (bucket.percentage / highestRatingPercentage) * 100,
                      )}%`,
                    }}
                    title={`${bucket.count.toLocaleString()} votes (${bucket.percentage}%)`}
                  >
                    <span
                      className={`absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[9px] font-semibold sm:block ${
                        bucket.score >= movie.rating
                          ? 'text-emerald-300'
                          : 'text-red-300'
                      }`}
                    >
                      {bucket.percentage}%
                    </span>
                  </div>
                </div>
                <span className="mt-2 block text-[10px] font-bold text-zinc-500 sm:text-xs">
                  {bucket.score}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-wider text-zinc-600">
            <span>Lower ratings</span>
            <span>Higher ratings</span>
          </div>
        </section>

        <section className="mt-6 pb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
              Viewer feedback
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-white">
              Community reviews
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Ten sample reviews returned with the movie details response.
            </p>
          </div>

          <div className="mt-5 grid items-start gap-6 xl:grid-cols-2">
            <ReviewGroup
              accent="positive"
              averageRating={movie.rating}
              reviews={aboveAverageReviews}
              title="Above average"
            />
            <ReviewGroup
              accent="critical"
              averageRating={movie.rating}
              reviews={belowAverageReviews}
              title="Below average"
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}m`
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
}

function DetailBlock({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </h3>
      <p className="mt-1 text-sm leading-6 text-zinc-300">
        {values.join(', ')}
      </p>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-xs">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right font-medium capitalize text-zinc-200">
        {value}
      </dd>
    </div>
  )
}

function ReviewGroup({
  title,
  reviews,
  averageRating,
  accent,
}: {
  title: string
  reviews: MovieReview[]
  averageRating: number
  accent: 'positive' | 'critical'
}) {
  const isPositive = accent === 'positive'

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
              <path
                d="M12 19V5m0 0l-5 5m5-5l5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </span>
          <h3 className="text-sm font-bold text-zinc-200">{title}</h3>
        </div>
        <span className="text-[10px] text-zinc-600">
          Compared with {averageRating}/10
        </span>
      </div>

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewCard key={review.id} accent={accent} review={review} />
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
    <article className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-zinc-700">
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
            <p className="truncate text-xs font-bold text-zinc-200">
              {review.author}
            </p>
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
          <svg
            aria-hidden="true"
            className="h-3 w-3 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {review.rating}
        </span>
      </div>

      <h4 className="mt-3 text-sm font-extrabold text-white">
        {review.title}
      </h4>
      <p className="mt-1.5 text-xs leading-6 text-zinc-400">
        {review.content}
      </p>

      <div className="mt-3 flex items-center gap-1.5 border-t border-zinc-800/80 pt-3 text-[10px] text-zinc-600">
        <svg
          aria-hidden="true"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M7 10v10H4V10h3zm4 10h6.5a2 2 0 001.94-1.51l1.25-5A2 2 0 0018.75 11H15l.75-3.75A2.7 2.7 0 0013.1 4L8 10v10h3z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.8}
          />
        </svg>
        {review.helpful_count} viewers found this helpful
      </div>
    </article>
  )
}
