'use client'

import { useState } from 'react'
import {
  movieRankingsData,
  type RankingCategory,
} from '../dummy/movieRankingsData'

const rankingCategories = Object.keys(movieRankingsData) as RankingCategory[]

function CategoryIcon({ category }: { category: RankingCategory }) {
  if (category === 'popular') {
    return (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3.75c1.75 2.03 3.5 4.22 3.5 6.75 0 .8-.2 1.55-.56 2.2.03-.23.06-.46.06-.7 0-1.95-1.17-3.45-3-5-1.83 1.55-3 3.05-3 5 0 .24.03.47.06.7A4.97 4.97 0 017.5 9.05C5.9 10.54 5 12.29 5 14.25a7 7 0 0014 0c0-4.2-2.76-7.55-7-10.5z"
      />
    )
  }

  if (category === 'rated') {
    return (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.78l-5.2 2.74.99-5.8-4.21-4.1 5.82-.85L12 3.5z"
      />
    )
  }

  return (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"
    />
  )
}

export default function TopMovies() {
  const [activeCategory, setActiveCategory] =
    useState<RankingCategory>('popular')
  const activeRanking = movieRankingsData[activeCategory]

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-900/70 shadow-xl shadow-black/20">
      <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="mt-1 text-xl font-extrabold tracking-tight text-white">
              Top Movies
            </h2>
          </div>
        </div>

        <div
          aria-label="Movie ranking category"
          className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 p-1"
          role="tablist"
        >
          {rankingCategories.map((category) => {
            const ranking = movieRankingsData[category]
            const isActive = activeCategory === category

            return (
              <button
                key={category}
                aria-controls="movie-ranking-panel"
                aria-selected={isActive}
                className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[9px] font-semibold transition ${isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                  : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                id={`movie-ranking-tab-${category}`}
                onClick={() => setActiveCategory(category)}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="h-3 w-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <CategoryIcon category={category} />
                </svg>
                <span className="truncate">{ranking.shortLabel}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div
        aria-labelledby={`movie-ranking-tab-${activeCategory}`}
        aria-live="polite"
        className="p-3"
        id="movie-ranking-panel"
        role="tabpanel"
      >
        <div className="px-1 pb-2 pt-1">
          <h3 className="text-sm font-bold text-zinc-100">
            {activeRanking.label}
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
            {activeRanking.description}
          </p>
        </div>

        <ol className="mt-1 space-y-1">
          {activeRanking.movies.map((movie, index) => (
            <li
              key={movie.id}
              className="group flex items-center gap-2.5 rounded-xl border border-transparent p-2 transition hover:border-zinc-800 hover:bg-zinc-800/60"
            >
              <span
                className={`w-4 shrink-0 text-center text-sm font-black ${index === 0 ? 'text-red-400' : 'text-zinc-600'
                  }`}
              >
                {index + 1}
              </span>

              <div
                aria-hidden="true"
                className={`relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ${movie.posterColor}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_55%)]" />
                <span className="absolute bottom-1 left-1 text-[7px] font-black uppercase tracking-wide text-white/60">
                  {movie.title.slice(0, 2)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-zinc-200 transition group-hover:text-white">
                  {movie.title}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                  {movie.year} · {movie.genre}
                </p>
                <div className="mt-1 flex items-center gap-2 text-[9px]">
                  <span className="inline-flex items-center gap-0.5 font-bold text-amber-400">
                    <svg
                      aria-hidden="true"
                      className="h-2.5 w-2.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {movie.rating}
                  </span>
                  <span className="text-zinc-600">•</span>
                  <span className="truncate text-zinc-500">{movie.metric}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-2 mt-3 flex items-center justify-center gap-1.5 border-t border-zinc-800 pt-3 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Demo rankings · Updated weekly
        </div>
      </div>
    </section>
  )
}
