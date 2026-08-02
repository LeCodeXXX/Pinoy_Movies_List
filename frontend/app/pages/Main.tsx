'use client'

import { useEffect, useMemo, useState } from 'react'
import DisplayMovies from '../components/DisplayMovies'
import GenreSections, {
  type GenreSectionData,
} from '../components/GenreSections'
import SearchMovies from '../components/SearchMovies'
import TopMovies from '../components/TopMovies'
import {
  featuredMovieGenres,
  movieGenreNames,
} from '@/app/constants/movieGenres'
import { getMovieRankings, getMovies, searchMovies } from '../services/movieApi'
import type { MovieRankingLists, MovieSummary } from '../types/movie'
import {
  defaultAdvancedSearchFilters,
  type AdvancedSearchFilters,
} from '../types/movieSearch'

const emptyRankings: MovieRankingLists = {
  popular: [],
  rated: [],
  voted: [],
}

const emptyGenreSections: GenreSectionData[] = featuredMovieGenres.map(
  (genre) => ({ error: null, genre, movies: [] }),
)

export default function Main() {
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedSearchFilters>(defaultAdvancedSearchFilters)
  const [popularMovies, setPopularMovies] = useState<MovieSummary[]>([])
  const [searchResults, setSearchResults] = useState<MovieSummary[]>([])
  const [rankings, setRankings] = useState<MovieRankingLists>(emptyRankings)
  const [genreSections, setGenreSections] =
    useState<GenreSectionData[]>(emptyGenreSections)
  const [isLoading, setIsLoading] = useState(true)
  const [areGenresLoading, setAreGenresLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [movieError, setMovieError] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [rankingError, setRankingError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadMovies() {
      const coreMoviesPromise = Promise.all([
        getMovies({ pageSize: 18, signal: controller.signal }),
        getMovieRankings(controller.signal),
      ])
        .then((responses) => ({ error: null, responses }))
        .catch((error: unknown) => ({ error, responses: null }))

      const genreSectionsPromise = Promise.all(
        featuredMovieGenres.map(async (genre): Promise<GenreSectionData> => {
          try {
            const response = await getMovies({
              genreId: genre.id,
              pageSize: 30,
              signal: controller.signal,
            })
            return { error: null, genre, movies: response.results }
          } catch (error) {
            return { error: getErrorMessage(error), genre, movies: [] }
          }
        }),
      )

      const [coreResult, loadedGenreSections] = await Promise.all([
        coreMoviesPromise,
        genreSectionsPromise,
      ])
      if (controller.signal.aborted) return

      if (coreResult.responses) {
        const [popular, appRankings] = coreResult.responses
        setPopularMovies(popular.results)
        setRankings(appRankings)
        setMovieError(null)
        setRankingError(null)
      } else {
        const message = getErrorMessage(coreResult.error)
        setMovieError(message)
        setRankingError(message)
      }

      setGenreSections(loadedGenreSections)
      setIsLoading(false)
      setAreGenresLoading(false)
    }

    void loadMovies()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const normalizedQuery = searchQuery.trim()
    if (!normalizedQuery) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await searchMovies(normalizedQuery, controller.signal)
        setSearchResults(response.results)
        setSearchError(null)
      } catch (error) {
        if (!controller.signal.aborted) setSearchError(getErrorMessage(error))
      } finally {
        if (!controller.signal.aborted) setIsSearching(false)
      }
    }, 350)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery])

  const normalizedQuery = searchQuery.trim()
  const displayMovies = normalizedQuery ? searchResults : popularMovies
  const displayError = normalizedQuery ? searchError : movieError
  const displayLoading = isLoading || (Boolean(normalizedQuery) && isSearching)

  const availableYears = useMemo(
    () =>
      Array.from(
        new Set(
          displayMovies
            .map((movie) => movie.release_date?.slice(0, 4))
            .filter((year): year is string => Boolean(year)),
        ),
      ).sort((first, second) => Number(second) - Number(first)),
    [displayMovies],
  )

  const clearMovieSearch = () => {
    setSearchQuery('')
    setAdvancedFilters(defaultAdvancedSearchFilters)
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-red-500 selection:text-white">
      <SearchMovies
        availableGenres={movieGenreNames}
        availableYears={availableYears}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onQueryChange={setSearchQuery}
        query={searchQuery}
      />

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-2 pb-4 pt-2 sm:px-6 lg:px-8">
        <div className="grid w-full items-start lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-2">
          <div className="min-w-0">
            <DisplayMovies
              advancedFilters={advancedFilters}
              error={displayError}
              isLoading={displayLoading}
              movies={displayMovies}
              onClearFilters={clearMovieSearch}
            />
          </div>
          <aside className="mx-auto w-full max-w-xl px-3 py-6 sm:px-6 lg:mx-0 lg:max-w-none lg:justify-self-end lg:px-0">
            <TopMovies
              error={rankingError}
              isLoading={isLoading}
              rankings={rankings}
            />
          </aside>
        </div>

        <GenreSections
          isLoading={areGenresLoading}
          sections={genreSections}
        />
      </main>
    </div>
  )
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}
