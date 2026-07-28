export type ReleasePeriod =
  | 'all'
  | 'before-2000'
  | '2000s'
  | '2010s'
  | '2020s'

export interface AdvancedSearchFilters {
  releasePeriod: ReleasePeriod
  minRating: string
  year: string
  genre: string
}

export const defaultAdvancedSearchFilters: AdvancedSearchFilters = {
  releasePeriod: 'all',
  minRating: 'all',
  year: 'all',
  genre: 'all',
}
