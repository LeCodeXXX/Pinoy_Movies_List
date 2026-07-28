'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type {
  MovieRankingCategory,
  MovieRankingLists,
  MovieSummary,
} from '../types/movie'

interface TopMoviesProps {
  error: string | null
  isLoading: boolean
  rankings: MovieRankingLists
}

const categories: MovieRankingCategory[] = ['popular', 'rated', 'voted']

const categoryDetails: Record<
  MovieRankingCategory,
  { label: string; shortLabel: string; description: string }
> = {
  popular: {
    label: 'Most Popular',
    shortLabel: 'Popular',
    description: 'Trending Philippine movies ranked by TMDB popularity.',
  },
  rated: {
    label: 'Best Rated',
    shortLabel: 'Top Rated',
    description: 'Highest-rated Philippine movies from TMDB viewers.',
  },
  voted: {
    label: 'Most Voted',
    shortLabel: 'Most Voted',
    description: 'Philippine movies with the most TMDB viewer votes.',
  },
}

export default function TopMovies({
  error,
  isLoading,
  rankings,
}: TopMoviesProps) {
  const [activeCategory, setActiveCategory] =
    useState<MovieRankingCategory>('popular')
  const activeDetails = categoryDetails[activeCategory]
  const movies = rankings[activeCategory].slice(0, 10)

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-800/90 bg-zinc-900/70 shadow-xl shadow-black/20">
      <div className="border-b border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-3">
        <h2 className="text-xl font-extrabold tracking-tight text-white">
          Top Movies
        </h2>
        <div
          aria-label="Movie ranking category"
          className="mt-2 grid grid-cols-3 gap-1 rounded-lg border border-zinc-800 bg-zinc-950/80 p-1"
          role="tablist"
        >
          {categories.map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                aria-controls="movie-ranking-panel"
                aria-selected={isActive}
                className={`flex min-w-0 items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[9px] font-semibold transition ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
                id={`movie-ranking-tab-${category}`}
                onClick={() => setActiveCategory(category)}
                role="tab"
                tabIndex={isActive ? 0 : -1}
                type="button"
              >
                <CategoryIcon category={category} />
                <span className="truncate">
                  {categoryDetails[category].shortLabel}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div
        aria-labelledby={`movie-ranking-tab-${activeCategory}`}
        className="p-3"
        id="movie-ranking-panel"
        role="tabpanel"
      >
        <div className="px-1 pb-2 pt-1">
          <h3 className="text-sm font-bold text-zinc-100">
            {activeDetails.label}
          </h3>
          <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
            {activeDetails.description}
          </p>
        </div>

        {isLoading ? (
          <RankingSkeleton />
        ) : error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-center text-xs text-red-300">
            Rankings are unavailable.
          </p>
        ) : (
          <ol className="mt-1 space-y-1">
            {movies.map((movie, index) => (
              <RankingMovie
                key={movie.id}
                category={activeCategory}
                movie={movie}
                rank={index + 1}
              />
            ))}
          </ol>
        )}

        <div className="mx-2 mt-3 flex items-center justify-center gap-1.5 border-t border-zinc-800 pt-3 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live data from TMDB
        </div>
      </div>
    </section>
  )
}

function RankingMovie({
  movie,
  rank,
  category,
}: {
  movie: MovieSummary
  rank: number
  category: MovieRankingCategory
}) {
  const metric =
    category === 'popular'
      ? `${movie.popularity.toFixed(1)} popularity`
      : category === 'rated'
        ? `${movie.tmdb_vote_average.toFixed(1)} / 10`
        : `${movie.tmdb_vote_count.toLocaleString()} votes`

  return (
    <li>
      <Link
        className="group flex items-center gap-2.5 rounded-xl border border-transparent p-2 transition hover:border-zinc-800 hover:bg-zinc-800/60"
        href={`/movies/${movie.id}`}
      >
        <span
          className={`w-4 shrink-0 text-center text-sm font-black ${
            rank === 1 ? 'text-red-400' : 'text-zinc-600'
          }`}
        >
          {rank}
        </span>
        <div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
          {movie.poster_url ? (
            <Image
              alt=""
              className="object-cover"
              fill
              sizes="40px"
              src={movie.poster_url}
            />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-zinc-200 group-hover:text-white">
            {movie.title}
          </p>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            {movie.release_date?.slice(0, 4) ?? 'TBA'}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-emerald-400">
            <svg aria-hidden="true" className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="truncate">{metric}</span>
          </div>
        </div>
      </Link>
    </li>
  )
}

function CategoryIcon({ category }: { category: MovieRankingCategory }) {
  const path =
    category === 'popular'
      ? 'M12 3.75c1.75 2.03 3.5 4.22 3.5 6.75 0 .8-.2 1.55-.56 2.2.03-.23.06-.46.06-.7 0-1.95-1.17-3.45-3-5-1.83 1.55-3 3.05-3 5 0 .24.03.47.06.7A4.97 4.97 0 017.5 9.05C5.9 10.54 5 12.29 5 14.25a7 7 0 0014 0c0-4.2-2.76-7.55-7-10.5z'
      : category === 'rated'
        ? 'M12 3.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L12 16.78l-5.2 2.74.99-5.8-4.21-4.1 5.82-.85L12 3.5z'
        : 'M7 11h10M7 15h7M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z'

  return (
    <svg aria-hidden="true" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} />
    </svg>
  )
}

function RankingSkeleton() {
  return (
    <div className="mt-2 space-y-2">
      {Array.from({ length: 10 }, (_, index) => (
        <div key={index} className="h-[72px] animate-pulse rounded-xl bg-zinc-800/60" />
      ))}
    </div>
  )
}
