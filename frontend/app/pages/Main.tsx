'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
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

export default function Main() {
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedSearchFilters>(defaultAdvancedSearchFilters)
  const [searchResults, setSearchResults] = useState<MovieSummary[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const popularMoviesQuery = useQuery({
    queryKey: [
      'movies',
      'catalog',
      {
        language: 'en-US',
        page: 1,
        pageSize: 18,
        sortBy: 'popularity.desc',
      },
    ],
    queryFn: ({ signal }) => getMovies({ pageSize: 18, signal }),
  })
  const rankingsQuery = useQuery({
    queryKey: ['movies', 'rankings', { limit: 10 }],
    queryFn: ({ signal }) => getMovieRankings(signal),
  })
  const genreMovieQueries = useQueries({
    queries: featuredMovieGenres.map((genre) => ({
      queryKey: [
        'movies',
        'catalog',
        {
          genreId: genre.id,
          language: 'en-US',
          page: 1,
          pageSize: 30,
          sortBy: 'popularity.desc',
        },
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        getMovies({ genreId: genre.id, pageSize: 30, signal }),
    })),
  })

  const popularMovies = popularMoviesQuery.data?.results ?? []
  const rankings = rankingsQuery.data ?? emptyRankings
  const genreSections: GenreSectionData[] = featuredMovieGenres.map(
    (genre, index) => {
      const query = genreMovieQueries[index]
      return {
        error: query.error ? getErrorMessage(query.error) : null,
        genre,
        movies: query.data?.results ?? [],
      }
    },
  )
  const isLoading = popularMoviesQuery.isPending
  const areGenresLoading = genreMovieQueries.some((query) => query.isPending)
  const movieError = popularMoviesQuery.error
    ? getErrorMessage(popularMoviesQuery.error)
    : null
  const rankingError = rankingsQuery.error
    ? getErrorMessage(rankingsQuery.error)
    : null

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
          <aside className="order-last mt-4 h-[420px] w-full max-w-none px-0 py-0 lg:order-none lg:mx-0 lg:mt-0 lg:h-auto lg:px-0 lg:py-2 lg:justify-self-end">
            <TopMovies
              className="mx-2 h-full lg:mx-0"
              error={rankingError}
              isLoading={rankingsQuery.isPending}
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
