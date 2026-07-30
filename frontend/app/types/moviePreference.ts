import type { MovieSummary } from './movie'

export type MovieListStatus = 'completed' | 'watching' | 'plan_to_watch'

export interface MoviePreference {
  id: string
  user_id: string
  movie_id: number
  status: MovieListStatus
  rating: number | null
  is_favorite: boolean
  movie: MovieSummary
  created_at: string
  updated_at: string
}

export interface MoviePreferenceListResponse {
  results: MoviePreference[]
}

export interface MoviePreferenceInput {
  status: MovieListStatus
  rating: number | null
  is_favorite: boolean
}

export const MOVIE_STATUS_LABELS: Record<MovieListStatus, string> = {
  completed: 'Completed',
  watching: 'Watching',
  plan_to_watch: 'Plan to Watch',
}
