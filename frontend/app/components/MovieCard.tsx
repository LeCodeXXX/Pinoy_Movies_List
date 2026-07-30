import Image from 'next/image'
import Link from 'next/link'
import { getMovieGenreNames } from '@/app/constants/movieGenres'
import type { MovieSummary } from '@/app/types/movie'

interface MovieCardProps {
  className?: string
  eager?: boolean
  movie: MovieSummary
}

export default function MovieCard({
  className = '',
  eager = false,
  movie,
}: MovieCardProps) {
  const year = movie.release_date?.slice(0, 4) ?? 'TBA'
  const genre = getMovieGenreNames(movie.genre_ids)[0] ?? 'Film'
  const hasRating = movie.tmdb_vote_count > 0 && movie.tmdb_vote_average > 0
  const rating = hasRating ? movie.tmdb_vote_average.toFixed(1) : 'N/A'

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-md transition hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50 ${className}`}
    >
      <Link
        aria-label={`View details for ${movie.title}`}
        className="relative block aspect-[2/3] overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 focus:outline-none"
        href={`/movies/${movie.id}`}
      >
        {movie.poster_url ? (
          <Image
            alt={`${movie.title} poster`}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            loading={eager ? 'eager' : 'lazy'}
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
            src={movie.poster_url}
          />
        ) : (
          <div className="flex h-full items-end p-4 text-sm font-bold text-zinc-500">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
            {genre}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-extrabold leading-tight text-white">
            {movie.title}
          </h3>
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 px-4 text-center opacity-0 backdrop-blur-[1px] transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-400">
            Rating
          </p>
          <div className="mt-1 flex items-end justify-center gap-1 text-white">
            <span className="text-4xl font-black leading-none tracking-tight sm:text-5xl">
              {rating}
            </span>
            {hasRating ? (
              <span className="pb-1 text-xs font-bold text-zinc-400">/10</span>
            ) : null}
          </div>
          <span className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-red-600 px-5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-red-950/40 transition group-hover:bg-red-500 group-focus-within:bg-red-500">
            Details
          </span>
        </div>
      </Link>

      <div className="flex flex-1 items-center justify-between gap-2 p-3 text-[10px] text-zinc-500">
        <span>{year}</span>
        <span>{movie.tmdb_vote_count.toLocaleString()} votes</span>
      </div>
    </article>
  )
}
