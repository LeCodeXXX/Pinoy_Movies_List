export const TMDB_MOVIE_GENRES: Readonly<Record<number, string>> = {
  12: 'Adventure',
  14: 'Fantasy',
  16: 'Animation',
  18: 'Drama',
  27: 'Horror',
  28: 'Action',
  35: 'Comedy',
  36: 'History',
  37: 'Western',
  53: 'Thriller',
  80: 'Crime',
  99: 'Documentary',
  878: 'Science Fiction',
  9648: 'Mystery',
  10402: 'Music',
  10749: 'Romance',
  10751: 'Family',
  10752: 'War',
  10770: 'TV Movie',
}

export interface MovieGenreOption {
  id: number
  name: string
}

export const movieGenres: MovieGenreOption[] = Object.entries(TMDB_MOVIE_GENRES)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((first, second) => first.name.localeCompare(second.name))

export const movieGenreNames = movieGenres.map((genre) => genre.name)

export const featuredMovieGenres = [
  { id: 10749, name: 'Romance' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 53, name: 'Thriller' },
] satisfies MovieGenreOption[]

export function getMovieGenreName(genreId: number) {
  return TMDB_MOVIE_GENRES[genreId] ?? 'Other'
}

export function getMovieGenreNames(genreIds: number[]) {
  return genreIds.map(getMovieGenreName)
}

export function getMovieGenre(genreId: number) {
  return movieGenres.find((genre) => genre.id === genreId)
}
