import Image from 'next/image'
import Link from 'next/link'
import { getMovieGenreNames } from '@/app/constants/movieGenres'
import type { MovieSummary } from '@/app/types/movie'

interface MovieCardProps {
  className?: string
  movie: MovieSummary
}

export default function MovieCard({ className = '', movie }: MovieCardProps) {
  const year = movie.release_date?.slice(0, 4) ?? 'TBA'
  const genre = getMovieGenreNames(movie.genre_ids)[0] ?? 'Film'

  return (
    <article
      className={`group flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-md transition hover:-translate-y-1 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/50 ${className}`}
    >
      <Link
        aria-label={`View details for ${movie.title}`}
        className="relative block aspect-[2/3] overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950"
        href={`/movies/${movie.id}`}
      >
        {movie.poster_url ? (
          <Image
            alt={`${movie.title} poster`}
            className="object-cover transition duration-500 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1280px) 25vw, 16vw"
            src={movie.poster_url}
          />
        ) : (
          <div className="flex h-full items-end p-4 text-sm font-bold text-zinc-500">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/20" />
        <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
          <svg aria-hidden="true" className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {movie.tmdb_vote_average.toFixed(1)}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
            {genre}
          </p>
          <h3 className="mt-0.5 line-clamp-2 text-sm font-extrabold leading-tight text-white">
            {movie.title}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 items-center justify-between gap-2 p-3 text-[10px] text-zinc-500">
        <span>{year}</span>
        <span>{movie.tmdb_vote_count.toLocaleString()} votes</span>
      </div>
    </article>
  )
}
