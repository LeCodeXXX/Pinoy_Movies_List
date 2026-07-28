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
  return parseResponse<MovieListResponse>(response)
}

export async function searchMovies(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({
    query,
    page: '1',
    language: 'en-US',
  })
  const response = await api(`/api/movies/search?${params}`, 'GET', { signal })
  return parseResponse<MovieListResponse>(response)
}

export async function getMovie(movieId: number, signal?: AbortSignal) {
  const response = await api(
    `/api/movies/${movieId}?language=en-US&region=PH`,
    'GET',
    { signal },
  )
  return parseResponse<MovieDetail>(response)
}
