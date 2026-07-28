'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import MovieCard from '@/app/components/MovieCard'
import type { MovieGenreOption } from '@/app/constants/movieGenres'
import { getMovies } from '@/app/services/movieApi'
import type { MovieListResponse } from '@/app/types/movie'

const MOVIES_PER_PAGE = 18

interface GenreMoviesPageProps {
  genre: MovieGenreOption
  page: number
}

export default function GenreMovies({ genre, page }: GenreMoviesPageProps) {
  const [response, setResponse] = useState<MovieListResponse | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const isCurrentPage = response?.page === page

  useEffect(() => {
    const controller = new AbortController()

    getMovies({
      genreId: genre.id,
      page,
      pageSize: MOVIES_PER_PAGE,
      signal: controller.signal,
    })
      .then((movieResponse) => {
        setResponse(movieResponse)
        setRequestError(null)
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setRequestError(
          error instanceof Error ? error.message : 'Unable to load this genre.',
        )
      })

    return () => controller.abort()
  }, [genre.id, page])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <Link
          className="group inline-flex items-center gap-3 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-600 hover:text-white"
          href="/"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span>
          Back to movies
        </Link>

        <header className="mb-7 mt-8 flex flex-wrap items-end justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
              Genre collection
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-white sm:text-5xl">
              {genre.name} Movies
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              18 Filipino movies per page
            </p>
          </div>
          {isCurrentPage ? (
            <p className="text-xs text-zinc-500">
              {response.total_results.toLocaleString()} movies found
            </p>
          ) : null}
        </header>

        {!isCurrentPage && !requestError ? (
          <GenreGridSkeleton />
        ) : requestError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-10 text-center">
            <h2 className="font-bold text-red-300">Unable to load movies</h2>
            <p className="mt-2 text-sm text-zinc-500">{requestError}</p>
          </div>
        ) : response && response.results.length ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {response.results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
            <GenrePagination
              currentPage={page}
              genreId={genre.id}
              totalPages={response.total_pages}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-zinc-500">
            No movies are available in this genre.
          </div>
        )}
      </main>
    </div>
  )
}

function GenrePagination({
  currentPage,
  genreId,
  totalPages,
}: {
  currentPage: number
  genreId: number
  totalPages: number
}) {
  const pages = Array.from(
    new Set(
      [1, currentPage - 1, currentPage, currentPage + 1, totalPages].filter(
        (pageNumber) => pageNumber >= 1 && pageNumber <= totalPages,
      ),
    ),
  ).sort((first, second) => first - second)

  return (
    <nav
      aria-label="Genre movie pages"
      className="mt-10 flex flex-wrap items-center justify-center gap-2 border-t border-zinc-800 pt-8"
    >
      <PaginationLink
        disabled={currentPage <= 1}
        genreId={genreId}
        label="Previous"
        page={currentPage - 1}
      />
      {pages.map((pageNumber, index) => (
        <span className="contents" key={pageNumber}>
          {index > 0 && pageNumber - pages[index - 1] > 1 ? (
            <span className="px-1 text-zinc-600">…</span>
          ) : null}
          <Link
            aria-current={pageNumber === currentPage ? 'page' : undefined}
            className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
              pageNumber === currentPage
                ? 'bg-red-600 text-white'
                : 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
            href={genrePageHref(genreId, pageNumber)}
          >
            {pageNumber}
          </Link>
        </span>
      ))}
      <PaginationLink
        disabled={currentPage >= totalPages}
        genreId={genreId}
        label="Next"
        page={currentPage + 1}
      />
      <span className="ml-2 text-xs text-zinc-500">
        Page {currentPage} of {totalPages}
      </span>
    </nav>
  )
}

function PaginationLink({
  disabled,
  genreId,
  label,
  page,
}: {
  disabled: boolean
  genreId: number
  label: string
  page: number
}) {
  const className =
    'inline-flex h-9 items-center rounded-lg border border-zinc-800 px-3 text-xs font-bold'

  return disabled ? (
    <span className={`${className} cursor-not-allowed text-zinc-700`}>{label}</span>
  ) : (
    <Link
      className={`${className} bg-zinc-900 text-zinc-300 transition hover:border-zinc-700 hover:text-white`}
      href={genrePageHref(genreId, page)}
    >
      {label}
    </Link>
  )
}

function genrePageHref(genreId: number, page: number) {
  return page <= 1 ? `/genres/${genreId}` : `/genres/${genreId}?page=${page}`
}

function GenreGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: MOVIES_PER_PAGE }, (_, index) => (
        <div
          key={index}
          className="aspect-[2/3] animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
        />
      ))}
    </div>
  )
}
