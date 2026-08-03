'use client'

import Link from 'next/link'
import { useRef } from 'react'
import type { MovieGenreOption } from '@/app/constants/movieGenres'
import type { MovieSummary } from '@/app/types/movie'
import MovieCard from './MovieCard'

export interface GenreSectionData {
  error: string | null
  genre: MovieGenreOption
  movies: MovieSummary[]
}

interface GenreSectionsProps {
  isLoading: boolean
  sections: GenreSectionData[]
}

export default function GenreSections({
  isLoading,
  sections,
}: GenreSectionsProps) {
  return (
    <section className="px-3 pb-16 pt-10 sm:px-6">
      <div className="space-y-20 sm:space-y-24">
        {sections.map((section) => (
          <GenreRow
            key={section.genre.id}
            isLoading={isLoading}
            section={section}
          />
        ))}
      </div>
    </section>
  )
}

function GenreRow({
  isLoading,
  section,
}: {
  isLoading: boolean
  section: GenreSectionData
}) {
  const rowRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: -1 | 1) => {
    const row = rowRef.current
    if (!row) return

    const firstCard = row.querySelector<HTMLElement>('[data-carousel-card]')
    const gap = Number.parseFloat(window.getComputedStyle(row).columnGap) || 20
    const scrollDistance = (firstCard?.offsetWidth ?? 176) + gap

    row.scrollBy({
      behavior: 'smooth',
      left: direction * scrollDistance,
    })
  }

  return (
    <section aria-labelledby={`genre-${section.genre.id}`}>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 sm:gap-4">
        <div className="group/label flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          <span
            aria-hidden="true"
            className="h-8 w-1 shrink-0 rounded-full bg-red-600 shadow-[0_0_18px_rgba(220,38,38,0.45)] sm:h-11 sm:w-1.5"
          />
          <div className="min-w-0">
            <h3
              className="truncate text-lg font-black tracking-tight text-white sm:text-2xl lg:text-3xl"
              id={`genre-${section.genre.id}`}
            >
              {section.genre.name}
            </h3>
            <span
              aria-hidden="true"
              className="mt-1.5 block h-0.5 w-8 rounded-full bg-red-600 transition-all duration-300 group-hover/label:w-16 sm:mt-2 sm:w-12 sm:group-hover/label:w-24"
            />
          </div>
        </div>

        <Link
          className="inline-flex h-8 shrink-0 items-center rounded-lg border border-red-500/30 bg-red-600 px-3 text-[10px] font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500 sm:h-10 sm:rounded-full sm:px-4 sm:text-xs"
          href={`/genres/${section.genre.id}`}
        >
          See More
        </Link>
      </div>

      {isLoading ? (
        <GenreRowSkeleton />
      ) : section.error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-6 text-sm text-red-300">
          Unable to load {section.genre.name} movies. {section.error}
        </div>
      ) : section.movies.length ? (
        <div className="group/carousel relative px-1 sm:px-2">
          <div
            className="scrollbar-hidden flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-5 sm:pb-4"
            ref={rowRef}
          >
            {section.movies.map((movie) => (
              <div
                className="w-[40vw] min-w-[140px] shrink-0 snap-start sm:w-52 lg:w-44"
                data-carousel-card
                key={movie.id}
              >
                <MovieCard className="h-full" movie={movie} />
              </div>
            ))}
          </div>

          <button
            aria-label={`Show previous ${section.genre.name} movie`}
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-950/95 text-xl font-bold text-white shadow-xl shadow-black/60 transition hover:scale-110 hover:border-red-400 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
            disabled={isLoading || section.movies.length <= 6}
            onClick={() => scroll(-1)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </svg>
          </button>
          <button
            aria-label={`Show next ${section.genre.name} movie`}
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zinc-950/95 text-xl font-bold text-white shadow-xl shadow-black/60 transition hover:scale-110 hover:border-red-400 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
            disabled={isLoading || section.movies.length <= 6}
            onClick={() => scroll(1)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M9 6l6 6-6 6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
              />
            </svg>
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">
          No {section.genre.name.toLowerCase()} movies are available.
        </div>
      )}
    </section>
  )
}

function GenreRowSkeleton() {
  return (
    <div className="flex gap-5 overflow-hidden px-1 sm:px-2">
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="aspect-[2/3] w-[40vw] min-w-[140px] shrink-0 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900 sm:w-52 lg:w-44"
        />
      ))}
    </div>
  )
}
