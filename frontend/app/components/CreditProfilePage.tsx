'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import MovieCard from './MovieCard'
import BackToMovies from './BackToMovies'
import { getCompanyMovies, getPersonMovies } from '../services/creditApi'
import type { CreditMoviesResponse } from '../types/people'

export default function CreditProfilePage({ kind }: { kind: 'person' | 'company' }) {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const [data, setData] = useState<CreditMoviesResponse | null>(null)
  const [movies, setMovies] = useState<CreditMoviesResponse['results']>([])
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) return
    const controller = new AbortController()
    const request = kind === 'person' ? getPersonMovies(id, 1, controller.signal) : getCompanyMovies(id, 1, controller.signal)
    request.then((response) => {
      setData(response)
      setMovies(response.results)
      setPage(1)
      setError(null)
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : 'Unable to load this profile.')
    })
    return () => controller.abort()
  }, [id, kind])

  async function loadMore() {
    if (!data || loadingMore || page >= data.total_pages) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const response = kind === 'person' ? await getPersonMovies(id, nextPage) : await getCompanyMovies(id, nextPage)
      setMovies((current) => [...current, ...response.results])
      setPage(nextPage)
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load more movies.')
    } finally {
      setLoadingMore(false)
    }
  }

  if (!Number.isInteger(id) || id < 1 || error) {
    return <ProfileMessage message={error ?? 'This profile ID is invalid.'} />
  }
  if (!data) return <div className="min-h-screen bg-zinc-950 p-6"><div className="mx-auto h-96 max-w-7xl animate-pulse rounded-3xl bg-zinc-900" /></div>

  const { profile } = data
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-5 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BackToMovies />
        <section className="relative mt-28 rounded-3xl border border-zinc-800 bg-zinc-900/70 px-5 pb-7 pt-24 text-center sm:px-8 sm:pb-9 sm:pt-28">
          <div className="absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 overflow-hidden rounded-3xl border-8 border-zinc-950 bg-zinc-800 shadow-2xl shadow-black/50 sm:-top-28 sm:h-56 sm:w-56">
            {profile.image_url ? <Image alt={`${profile.name} image`} className="object-cover" fill sizes="224px" src={profile.image_url} /> : null}
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">{profile.role ?? (kind === 'person' ? 'Film profile' : 'Production company')}</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">{profile.name}</h1>
          {profile.description ? <p className="mx-auto mt-3 max-w-3xl text-xs leading-6 text-zinc-400 sm:text-sm sm:leading-7">{profile.description}</p> : null}
        </section>

        <section className="mt-8 pb-12">
          <div className="flex items-end justify-between gap-4">
            <div><h2 className="text-2xl font-black text-white">Movies</h2><p className="mt-1 text-xs text-zinc-500">Showing {movies.length} of {data.total_results}</p></div>
          </div>
          {movies.length ? <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"><>{movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}</></div> : <p className="mt-5 rounded-2xl border border-zinc-800 p-6 text-sm text-zinc-500">No movies found.</p>}
          {page < data.total_pages ? <button className="mx-auto mt-8 block rounded-lg bg-blue-600 px-6 py-3 text-xs font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60" disabled={loadingMore} onClick={loadMore} type="button">{loadingMore ? 'Loading…' : 'More movies'}</button> : null}
        </section>
      </div>
    </main>
  )
}

function ProfileMessage({ message }: { message: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-center"><div><h1 className="text-2xl font-black text-white">Profile unavailable</h1><p className="mt-2 text-sm text-zinc-500">{message}</p><Link className="mt-5 inline-block text-sm font-bold text-blue-400 hover:text-blue-300" href="/">Back to movies</Link></div></div>
}
