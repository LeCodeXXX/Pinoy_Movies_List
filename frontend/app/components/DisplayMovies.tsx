import { getMovieGenreNames } from '@/app/constants/movieGenres'
import type { MovieSummary } from '@/app/types/movie'
import type { AdvancedSearchFilters } from '@/app/types/movieSearch'
import MovieCard from './MovieCard'

interface DisplayMoviesProps {
  advancedFilters: AdvancedSearchFilters
  error: string | null
  isLoading: boolean
  movies: MovieSummary[]
  onClearFilters: () => void
}

const INITIAL_MOVIE_COUNT = 18

export default function DisplayMovies({
  advancedFilters,
  error,
  isLoading,
  movies,
  onClearFilters,
}: DisplayMoviesProps) {
  const filteredMovies = movies
    .filter((movie) => matchesAdvancedFilters(movie, advancedFilters))
    .slice(0, INITIAL_MOVIE_COUNT)

  return (
    <section className="mx-auto w-full max-w-[1500px] px-3 py-6 text-zinc-100 sm:px-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Movies
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Discover the first 18 popular Filipino movies.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] text-zinc-400">
          {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
        </span>
      </div>

      {isLoading ? (
        <MovieGridSkeleton />
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center">
          <p className="text-sm font-semibold text-red-300">Unable to load movies</p>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <p className="text-zinc-400">No movies match this search.</p>
          <button
            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-700"
            onClick={onClearFilters}
            type="button"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
          {filteredMovies.map((movie, index) => (
            <MovieCard eager={index === 0} key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}

function matchesAdvancedFilters(
  movie: MovieSummary,
  filters: AdvancedSearchFilters,
) {
  const year = movie.release_date ? Number(movie.release_date.slice(0, 4)) : null
  const genres = getMovieGenreNames(movie.genre_ids)
  const matchesGenre = filters.genre === 'all' || genres.includes(filters.genre)
  const matchesYear = filters.year === 'all' || year === Number(filters.year)
  const matchesRating =
    filters.minRating === 'all' ||
    movie.tmdb_vote_average >= Number(filters.minRating)
  const matchesReleasePeriod = (() => {
    if (year === null) return filters.releasePeriod === 'all'
    switch (filters.releasePeriod) {
      case 'before-2000':
        return year < 2000
      case '2000s':
        return year >= 2000 && year <= 2009
      case '2010s':
        return year >= 2010 && year <= 2019
      case '2020s':
        return year >= 2020
      default:
        return true
    }
  })()

  return matchesGenre && matchesYear && matchesRating && matchesReleasePeriod
}

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 2xl:grid-cols-6">
      {Array.from({ length: INITIAL_MOVIE_COUNT }, (_, index) => (
        <div
          key={index}
          className="aspect-[2/3] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
        />
      ))}
    </div>
  )
}
