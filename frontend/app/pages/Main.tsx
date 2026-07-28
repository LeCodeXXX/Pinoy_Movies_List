'use client'

import { useEffect, useState } from 'react'
import api from '../utils/api'
import DisplayMovies from '../components/DisplayMovies'
import SearchMovies from '../components/SearchMovies'
import TopMovies from '../components/TopMovies'
import {
  defaultAdvancedSearchFilters,
  type AdvancedSearchFilters,
} from '../types/movieSearch'

export default function Main() {
  const [apiStatus, setApiStatus] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [advancedFilters, setAdvancedFilters] =
    useState<AdvancedSearchFilters>(defaultAdvancedSearchFilters)

  const clearMovieSearch = () => {
    setSearchQuery('')
    setAdvancedFilters(defaultAdvancedSearchFilters)
  }

  useEffect(() => {
    const getInfo = async () => {
      try {
        const response = await api('/')
        const data = await response.json()
        setApiStatus(data.message)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    void getInfo()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-red-500 selection:text-white">
      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col px-2 py-4 sm:px-6 lg:px-8">
        {apiStatus && (
          <div className="mx-3 mb-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-xs text-zinc-400 sm:mx-6">
            <span className="font-semibold text-zinc-300">
              Backend API Status:
            </span>{' '}
            {apiStatus}
          </div>
        )}

        <div className="px-3 sm:px-6">
          <SearchMovies
            filters={advancedFilters}
            onFiltersChange={setAdvancedFilters}
            onQueryChange={setSearchQuery}
            query={searchQuery}
          />
        </div>

        <div className="grid w-full items-start lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-2">
          <div className="min-w-0">
            <DisplayMovies
              advancedFilters={advancedFilters}
              onClearFilters={clearMovieSearch}
              searchQuery={searchQuery}
            />
          </div>
          <aside className="mx-auto w-full max-w-xl px-3 py-6 sm:px-6 lg:mx-0 lg:max-w-none lg:justify-self-end lg:px-0">
            <TopMovies />
          </aside>
        </div>
      </main>
    </div>
  )
}
