import type {
  MovieReview,
  MovieReviewInput,
  MovieReviewListResponse,
} from '../types/movieReview'
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

function userReviewPath(userId: string, movieId?: number) {
  const base = `/api/users/${encodeURIComponent(userId)}/reviews`
  return movieId ? `${base}/${movieId}` : base
}

export async function getMovieReviews(movieId: number, signal?: AbortSignal) {
  const response = await api(`/api/movies/${movieId}/reviews`, 'GET', { signal })
  return parseResponse<MovieReviewListResponse>(response)
}

export async function getUserReviews(userId: string, signal?: AbortSignal) {
  const response = await api(userReviewPath(userId), 'GET', { signal })
  return parseResponse<MovieReviewListResponse>(response)
}

export async function getUserMovieReview(
  userId: string,
  movieId: number,
  signal?: AbortSignal,
) {
  const response = await api(userReviewPath(userId, movieId), 'GET', { signal })
  if (response.status === 404) return null
  return parseResponse<MovieReview>(response)
}

export async function saveMovieReview(
  userId: string,
  movieId: number,
  input: MovieReviewInput,
) {
  const response = await api(userReviewPath(userId, movieId), 'PUT', {
    body: JSON.stringify(input),
    headers: { 'Content-Type': 'application/json' },
  })
  return parseResponse<MovieReview>(response)
}
