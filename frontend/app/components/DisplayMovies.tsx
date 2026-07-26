'use client'

import React, { useState } from 'react'
import { moviesData } from '../dummy/moviesData'

export default function DisplayMovies() {
  const [selectedGenre, setSelectedGenre] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  // Extract unique genres dynamically
  const genres = ['All', ...Array.from(new Set(moviesData.map((m) => m.genre)))]

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredMovies = moviesData.filter((movie) => {
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre
    const matchesSearch =
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.director.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesGenre && matchesSearch
  })

  return (
    <div className="mx-auto w-full max-w-[1500px] px-3 py-6 text-zinc-100 sm:px-6">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-red-400">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
            Pinoy Cinema Vault
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Popular Movies
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            Hand-picked iconic masterpieces of Philippine cinema.
          </p>
        </div>

        {/* Search & Stats */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search 18 classic movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/90 py-2 pl-10 pr-4 text-xs text-white placeholder-zinc-500 transition focus:border-red-500/50 focus:outline-none focus:ring-1 focus:ring-red-500/50 sm:w-64 sm:text-sm"
            />
          </div>
          <span className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-400 shadow-sm">
            {filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'}
          </span>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${selectedGenre === genre
              ? 'border border-red-500/40 bg-red-600 text-white shadow-md shadow-red-950/40'
              : 'border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/80 hover:text-white'
              }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Movie Cards Grid - 6 Columns Layout */}
      {filteredMovies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40 p-12 text-center">
          <p className="text-zinc-400">No movies found matching your search.</p>
          <button
            onClick={() => {
              setSelectedGenre('All')
              setSearchQuery('')
            }}
            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filteredMovies.map((movie, index) => {
            // Determine if card is on the right side of the 6-col grid to expand inwards
            const isRightSide = (index % 6) >= 3

            return (
              <div key={movie.id} className="group relative h-[320px] w-full">
                {/* Fixed Height Overlay Card */}
                <article
                  className={`absolute top-0 z-10 flex flex-col w-full h-[320px] overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900 shadow-md backdrop-blur-md transition-all duration-300 ease-out group-hover:z-50 group-hover:w-[370px] group-hover:flex-row group-hover:border-zinc-700 group-hover:shadow-2xl group-hover:shadow-black/95 ${isRightSide ? 'left-0 group-hover:left-auto group-hover:right-0' : 'left-0'
                    }`}
                >
                  {/* Poster / Header Box */}
                  <div
                    className={`relative flex h-[230px] w-full shrink-0 flex-col justify-between bg-gradient-to-br ${movie.posterColor} p-4 transition-all duration-300 group-hover:h-full group-hover:w-44`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent)] pointer-events-none" />

                    {/* Top Row: Rating & Favorite */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-amber-400 backdrop-blur-md">
                        <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {movie.rating}
                      </span>
                    </div>

                    {/* Poster Label */}
                    <div className="relative z-10 mt-auto">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-white/60">
                        {movie.genre}
                      </span>
                      <div className="text-xs font-bold leading-tight text-white/90 drop-shadow line-clamp-1 group-hover:hidden">
                        {movie.title}
                      </div>
                    </div>
                  </div>

                  {/* Content Area - Constant height h-full */}
                  <div className="flex h-full flex-1 flex-col justify-between p-4 transition-all duration-300 group-hover:p-5">
                    {/* Compact Title & Genre (Visible when NOT expanded) */}
                    <div className="group-hover:hidden flex flex-col justify-between h-full">
                      <div>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400">
                          <span>{movie.year}</span>
                          <span>•</span>
                          <span>{movie.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details View (Visible ONLY on Hover) */}
                    <div className="hidden group-hover:flex group-hover:flex-col group-hover:justify-between h-full w-full">
                      <div>
                        {/* Top Meta info */}
                        <div className="flex items-center justify-between gap-1">
                          <span className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-red-400">
                            {movie.genre}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {movie.year} • {movie.duration}
                          </span>
                        </div>

                        {/* Title & Director */}
                        <h3 className="mt-2 text-sm font-bold text-white leading-tight">
                          {movie.title}
                        </h3>
                        <p className="mt-0.5 text-[11px] text-zinc-400">
                          Dir. <span className="text-zinc-200 font-medium">{movie.director}</span>
                        </p>

                        {/* Description */}
                        <p className="mt-2 text-[11px] leading-relaxed text-zinc-400 line-clamp-4">
                          {movie.description}
                        </p>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          HD Available
                        </span>
                        <button className="group/btn inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-950/50 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition-all hover:border-red-500 hover:bg-red-600 hover:text-white">
                          <span>Details</span>
                          <svg
                            className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
