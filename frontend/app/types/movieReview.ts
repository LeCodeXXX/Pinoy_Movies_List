import type { MovieSummary } from './movie'

export interface ReviewAuthor {
  id: string
  username: string
  display_name: string
  profile_picture: string | null
}

export interface MovieReview {
  id: string
  user_id: string
  movie_id: number
  rating: number
  review: string
  movie: MovieSummary
  author: ReviewAuthor
  created_at: string
  updated_at: string
}

export interface MovieReviewInput {
  rating: number
  review: string
}

export interface MovieReviewListResponse {
  results: MovieReview[]
}
