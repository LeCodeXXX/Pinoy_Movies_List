export interface Genre {
  id: number
  name: string
}

export interface PersonCredit {
  id: number
  name: string
  profile_url: string | null
}

export interface CastMember extends PersonCredit {
  character: string | null
}

export interface CrewMember extends PersonCredit {
  job: string
}

export interface Trailer {
  name: string
  youtube_key: string
  url: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_url: string | null
  origin_country: string | null
}

export interface SpokenLanguage {
  code: string
  name: string
}

export interface WatchProvider {
  id: number
  name: string
  logo_url: string | null
}

export interface StreamingAvailability {
  link: string | null
  streaming: WatchProvider[]
  free: WatchProvider[]
  ads: WatchProvider[]
  rent: WatchProvider[]
  buy: WatchProvider[]
  attribution: string
}

export interface MovieSummary {
  id: number
  title: string
  original_title: string
  original_language: string
  poster_url: string | null
  backdrop_url: string | null
  synopsis: string
  release_date: string | null
  genre_ids: number[]
  popularity: number
  tmdb_vote_average: number
  tmdb_vote_count: number
}

export interface MovieListResponse {
  page: number
  total_pages: number
  total_results: number
  results: MovieSummary[]
}

export interface MovieDetail {
  id: number
  title: string
  original_title: string
  original_language: string
  poster_url: string | null
  backdrop_url: string | null
  synopsis: string
  tagline: string | null
  release_date: string | null
  runtime: number | null
  status: string | null
  genres: Genre[]
  cast: CastMember[]
  director: CrewMember | null
  writers: CrewMember[]
  trailer: Trailer | null
  production_companies: ProductionCompany[]
  spoken_languages: SpokenLanguage[]
  budget: number
  revenue: number
  homepage: string | null
  imdb_id: string | null
  popularity: number
  tmdb_vote_average: number
  tmdb_vote_count: number
  streaming_availability: StreamingAvailability
  similar_movies: MovieSummary[]
}

export type MovieRankingCategory = 'popular' | 'rated' | 'voted'

export type MovieRankingLists = Record<MovieRankingCategory, MovieSummary[]>
