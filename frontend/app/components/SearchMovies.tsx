'use client'

import { useState } from 'react'
import AuthMenu from './AuthMenu'
import {
  defaultAdvancedSearchFilters,
  type AdvancedSearchFilters,
} from '../types/movieSearch'

interface SearchMoviesProps {
  query: string
  availableGenres: string[]
  availableYears: string[]
  filters: AdvancedSearchFilters
  onFiltersChange: (filters: AdvancedSearchFilters) => void
  onQueryChange: (query: string) => void
}

const selectClassName =
  'w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 pr-8 text-xs text-zinc-200 outline-none transition focus:border-red-500/50 focus:ring-1 focus:ring-red-500/40'

export default function SearchMovies({
  query,
  availableGenres,
  availableYears,
  filters,
  onFiltersChange,
  onQueryChange,
}: SearchMoviesProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== 'all',
  ).length

  const updateFilter = <Key extends keyof AdvancedSearchFilters>(
    key: Key,
    value: AdvancedSearchFilters[Key],
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-zinc-800/90 bg-zinc-900/95 shadow-xl shadow-black/30 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <div className="min-w-0 flex-1 lg:w-56 lg:flex-none lg:shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
            Pinoy Cinema Vault
          </p>
          <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-white">
            Discover Filipino cinema
          </h1>
        </div>

        <div className="order-3 flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:order-none lg:flex-1">
          <div className="relative min-w-0 flex-1">
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            <input
              aria-label="Search popular movies"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/90 py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 transition focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search title, director, description, or genre..."
              type="search"
              value={query}
            />
            {query && (
              <button
                aria-label="Clear search text"
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                onClick={() => onQueryChange('')}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            aria-controls="advanced-movie-search"
            aria-expanded={isAdvancedOpen}
            className={'inline-flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-white'}
            onClick={() => setIsAdvancedOpen((current) => !current)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M4 6h16M7 12h10M10 18h4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
            Advanced
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] text-white">
                {activeFilterCount}
              </span>
            )}
            <svg
              aria-hidden="true"
              className={`h-3.5 w-3.5 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>

        <AuthMenu />
      </div>

      {isAdvancedOpen && (
        <div
          className="absolute left-0 right-0 top-full z-10 mt-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-4"
          id="advanced-movie-search"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            {activeFilterCount > 0 && (
              <button
                className="text-[11px] font-semibold text-red-400 transition hover:text-red-300"
                onClick={() =>
                  onFiltersChange(defaultAdvancedSearchFilters)
                }
                type="button"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Release date
              <span className="relative block">
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    updateFilter(
                      'releasePeriod',
                      event.target.value as AdvancedSearchFilters['releasePeriod'],
                    )
                  }
                  value={filters.releasePeriod}
                >
                  <option value="all">Any date</option>
                  <option value="before-2000">Before 2000</option>
                  <option value="2000s">2000–2009</option>
                  <option value="2010s">2010–2019</option>
                  <option value="2020s">2020 and newer</option>
                </select>
                <SelectArrow />
              </span>
            </label>

            <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Minimum rating
              <span className="relative block">
                <select
                  className={selectClassName}
                  onChange={(event) =>
                    updateFilter('minRating', event.target.value)
                  }
                  value={filters.minRating}
                >
                  <option value="all">Any rating</option>
                  <option value="8">8.0 and above</option>
                  <option value="7.5">7.5 and above</option>
                  <option value="7">7.0 and above</option>
                </select>
                <SelectArrow />
              </span>
            </label>

            <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Year
              <span className="relative block">
                <select
                  className={selectClassName}
                  onChange={(event) => updateFilter('year', event.target.value)}
                  value={filters.year}
                >
                  <option value="all">Any year</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </span>
            </label>

            <label className="space-y-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Genre
              <span className="relative block">
                <select
                  className={selectClassName}
                  onChange={(event) => updateFilter('genre', event.target.value)}
                  value={filters.genre}
                >
                  <option value="all">All genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <SelectArrow />
              </span>
            </label>
          </div>
        </div>
      )}
    </header>
  )
}

function SelectArrow() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-600"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M19 9l-7 7-7-7"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      />
    </svg>
  )
}
