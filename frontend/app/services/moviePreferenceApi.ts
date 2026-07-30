import type {
  MoviePreference,
  MoviePreferenceInput,
  MoviePreferenceListResponse,
} from '../types/moviePreference'
import api from '../utils/api'

async function parseResponse<ResponseType>(response: Response) {
  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      detail?: string
    } | null
    throw new Error(errorBody?.detail ?? `Request failed (${response.status})`)
  }
  return (await response.json()) as ResponseType
}

function preferencePath(userId: string, movieId?: number) {
  const base = `/api/users/${encodeURIComponent(userId)}/movie-preferences`
  return movieId ? `${base}/${movieId}` : base
}

export async function getMoviePreferences(userId: string, signal?: AbortSignal) {
  const response = await api(preferencePath(userId), 'GET', { signal })
  return parseResponse<MoviePreferenceListResponse>(response)
}

export async function getMoviePreference(
  userId: string,
  movieId: number,
  signal?: AbortSignal,
) {
  const response = await api(preferencePath(userId, movieId), 'GET', { signal })
  if (response.status === 404) return null
  return parseResponse<MoviePreference>(response)
}

export async function saveMoviePreference(
  userId: string,
  movieId: number,
  input: MoviePreferenceInput,
) {
  const response = await api(preferencePath(userId, movieId), 'PUT', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  })
  return parseResponse<MoviePreference>(response)
}
