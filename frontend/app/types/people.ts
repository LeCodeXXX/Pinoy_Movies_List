import type { MovieSummary } from './movie'

export interface CreditProfile {
  id: number
  name: string
  description: string
  image_url: string | null
  kind: 'person' | 'company'
  role: string | null
}

export interface CreditMoviesResponse {
  profile: CreditProfile
  page: number
  total_pages: number
  total_results: number
  results: MovieSummary[]
}
