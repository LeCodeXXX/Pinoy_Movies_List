'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useEffect, useState } from 'react'
import BackToMovies from '@/app/components/BackToMovies'
import MovieReviews from '@/app/components/movie-details/MovieReviews'
import MoviePreferenceModal from '@/app/components/movie-preferences/MoviePreferenceModal'
import { getMovie } from '@/app/services/movieApi'
import { getMoviePreference } from '@/app/services/moviePreferenceApi'
import type { AuthUser } from '@/app/types/auth'
import type { MovieDetail } from '@/app/types/movie'
import type { MoviePreference } from '@/app/types/moviePreference'

const AUTH_USER_STORAGE_KEY = 'pinoy-cinema-auth-user'

export default function MovieDetails() {
  const params = useParams<{ id: string }>()
  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [preference, setPreference] = useState<MoviePreference | null>(null)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [listMessage, setListMessage] = useState<string | null>(null)
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

  useEffect(() => {
    if (!isValidMovieId) return
    const controller = new AbortController()
    const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
    if (!storedUser) return

    let parsedUser: AuthUser
    try {
      parsedUser = JSON.parse(storedUser) as AuthUser
      void Promise.resolve().then(() => {
        if (!controller.signal.aborted) setUser(parsedUser)
      })
    } catch {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
      return
    }

    getMoviePreference(parsedUser.id, movieId, controller.signal)
      .then(setPreference)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error('Failed to load movie preference', error)
        }
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

  const currentPreference =
    preference?.movie_id === movieId ? preference : null

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
          <BackToMovies />
        </nav>

        <MovieHero
          hasPreference={currentPreference !== null}
          listMessage={listMessage}
          movie={movie}
          onEditList={() => {
            if (!user) {
              setListMessage('Sign in first to save movies to your list.')
              return
            }
            setListMessage(null)
            setIsListModalOpen(true)
          }}
        />

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
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Director</h3>
                  {movie.director ? <Link className="mt-1 block text-sm leading-6 text-zinc-300 hover:text-blue-400" href={`/people/${movie.director.id}`}>{movie.director.name}</Link> : <p className="mt-1 text-sm leading-6 text-zinc-300">Not provided</p>}
                </div>
                <DetailBlock
                  label="Writers"
                  values={movie.writers.map((writer) => writer.name)}
                />
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Production companies</h3>
                  <div className="mt-1 flex flex-col items-start gap-1 text-sm leading-6 text-zinc-300">
                    {movie.production_companies.length ? movie.production_companies.map((company) => <Link key={company.id} className="hover:text-blue-400" href={`/companies/${company.id}`}>{company.name}</Link>) : <span>Not provided</span>}
                  </div>
                </div>
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

        <div className="mt-10">
          <CommunityRating movie={movie} />
        </div>
        <MovieReviews
          key={`${movie.id}:${user?.id ?? 'guest'}`}
          movie={movie}
          user={user}
        />
        <div className="mt-10">
          <SimilarMovies movie={movie} />
        </div>
      </main>

      {user && isListModalOpen ? (
        <MoviePreferenceModal
          existingPreference={currentPreference}
          isOpen
          movie={movie}
          onClose={() => setIsListModalOpen(false)}
          onSaved={(savedPreference) => {
            setPreference(savedPreference)
            setListMessage('Your movie list has been updated.')
          }}
          userId={user.id}
        />
      ) : null}
    </div>
  )
}

function MovieHero({
  hasPreference,
  listMessage,
  movie,
  onEditList,
}: {
  hasPreference: boolean
  listMessage: string | null
  movie: MovieDetail
  onEditList: () => void
}) {
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
              <span key={genre.id} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold">
                {genre.name}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">{movie.title}</h1>
          {movie.tagline ? <p className="mt-2 text-lg italic text-zinc-400">“{movie.tagline}”</p> : null}
          <p className="mt-4 text-sm text-zinc-400">{movie.original_title} · {movie.release_date?.slice(0, 4) ?? 'TBA'}</p>
          <div className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2">
            <span className="text-3xl font-black">
              {movie.vote_count > 0 ? movie.vote_average.toFixed(1) : 'N/A'}
            </span>
            <span className="text-xs text-zinc-500">
              {movie.vote_count > 0
                ? `/ 10 · ${movie.vote_count.toLocaleString()} app votes`
                : 'No app ratings yet'}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              className="rounded-lg bg-blue-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500"
              onClick={onEditList}
              type="button"
            >
              {hasPreference ? 'Edit List Entry' : 'Add to List'}
            </button>
            {listMessage ? (
              <p className="text-xs font-medium text-zinc-400" role="status">
                {listMessage}
              </p>
            ) : null}
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
            <Link className="truncate text-sm font-bold text-zinc-200 hover:text-blue-400" href={`/people/${member.id}`}>{member.name}</Link>
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

function CommunityRating({ movie }: { movie: MovieDetail }) {
  const score = Math.min(10, Math.max(0, movie.vote_average))
  const distribution = movie.rating_distribution?.length === 10
    ? movie.rating_distribution
    : Array.from({ length: 10 }, () => 0)
  const chartData = distribution.map((frequency, index) => ({
    rating: index + 1,
    frequency,
  }))
  return (
    <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">App community score</p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-extrabold text-white">User rating</h2>
        <p><span className="text-3xl font-black text-white">{movie.vote_count > 0 ? score.toFixed(1) : 'N/A'}</span>{movie.vote_count > 0 ? <span className="text-sm text-zinc-500"> / 10</span> : null}</p>
      </div>
      <div className="mt-6 rounded-xl bg-zinc-950/40 px-3 pb-3 pt-4">
        <div className="h-40" aria-label="Frequency of user ratings from 1 to 10">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="rating" tick={{ fill: '#71717a', fontSize: 10 }} tickLine={false} />
              <YAxis allowDecimals={false} hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`${value} rating${value === 1 ? '' : 's'}`, 'Frequency']}
                labelFormatter={(label) => `${label}/10`}
                cursor={{ fill: '#27272a', opacity: 0.35 }}
              />
              <Bar dataKey="frequency" fill="#3b82f6" radius={[3, 3, 0, 0]}>
                <LabelList dataKey="frequency" fill="#a1a1aa" fontSize={10} position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-4 text-xs text-zinc-500">
        {movie.vote_count > 0
          ? `Based on ${movie.vote_count.toLocaleString()} rating${movie.vote_count === 1 ? '' : 's'} from users of this app.`
          : 'No users have rated this movie yet.'}
      </p>
    </section>
  )
}

function SimilarMovies({ movie }: { movie: MovieDetail }) {
  if (!movie.similar_movies.length) return null
  return (
    <section className="pb-10 pt-2">
      <h2 className="text-xl font-extrabold text-white">Similar movies</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
        {movie.similar_movies.map((similar) => (
          <Link key={similar.id} className="w-28 shrink-0" href={`/movies/${similar.id}`}>
            <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
              {similar.poster_url ? <Image alt="" className="object-cover" fill sizes="112px" src={similar.poster_url} /> : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-bold text-zinc-300">{similar.title}</p>
          </Link>
        ))}
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
  return <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center"><div><h1 className="text-2xl font-black text-white">Movie unavailable</h1><p className="mt-2 text-sm text-zinc-500">{message ?? 'The movie could not be loaded.'}</p><BackToMovies className="mt-5" /></div></div>
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
