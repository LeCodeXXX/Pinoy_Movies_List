import type { MovieDetail, MovieListResponse } from '../types/movie'
import api from '../utils/api'

export type MovieSort =
  | 'popularity.desc'
  | 'primary_release_date.desc'
  | 'revenue.desc'
  | 'vote_average.desc'
  | 'vote_count.desc'

interface GetMoviesOptions {
  genreId?: number
  page?: number
  pageSize?: number
  signal?: AbortSignal
  sortBy?: MovieSort
}

async function parseResponse<ResponseType>(response: Response) {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      detail?: string
    } | null
    throw new Error(errorBody?.detail ?? `Request failed (${response.status})`)
  }

  return (await response.json()) as ResponseType
}

export async function getMovies({
  genreId,
  page = 1,
  pageSize = 20,
  signal,
  sortBy = 'popularity.desc',
}: GetMoviesOptions = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
    language: 'en-US',
    sort_by: sortBy,
  })
  if (genreId) params.set('genre_id', String(genreId))

  const response = await api(`/api/movies?${params}`, 'GET', { signal })
  return deduplicateMovieList(await parseResponse<MovieListResponse>(response))
}

export async function searchMovies(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    query,
    page: '1',
    language: 'en-US',
  })
  const response = await api(`/api/movies/search?${params}`, 'GET', { signal })
  return deduplicateMovieList(await parseResponse<MovieListResponse>(response))
}

export async function getMovie(movieId: number, signal?: AbortSignal) {
  const response = await api(
    `/api/movies/${movieId}?language=en-US&region=PH`,
    'GET',
    { signal },
  )
  const movie = await parseResponse<MovieDetail>(response)
  return {
    ...movie,
    similar_movies: uniqueMoviesById(movie.similar_movies),
  }
}

function deduplicateMovieList(response: MovieListResponse): MovieListResponse {
  return {
    ...response,
    results: uniqueMoviesById(response.results),
  }
}

function uniqueMoviesById<Movie extends { id: number }>(movies: Movie[]) {
  const seenIds = new Set<number>()
  return movies.filter((movie) => {
    if (seenIds.has(movie.id)) return false
    seenIds.add(movie.id)
    return true
  })
}
