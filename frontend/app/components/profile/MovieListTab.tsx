'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, type ReactNode } from 'react'
import { MOVIE_STATUS_LABELS, type MoviePreference } from '@/app/types/moviePreference'

export type ViewMode = 'grid' | 'detailed' | 'compact'
type SortOption = 'date' | 'name' | 'rating'
export type MovieListItem = MoviePreference

interface MovieListTabProps {
  items: MovieListItem[]
  onEdit: (item: MovieListItem) => void
}

export default function MovieListTab({ items, onEdit }: MovieListTabProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('compact')
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const sortedItems = useMemo(() => {
    return [...items].sort((first, second) => {
      if (sortBy === 'name') return first.movie.title.localeCompare(second.movie.title)
      if (sortBy === 'rating') return (second.rating ?? -1) - (first.rating ?? -1)
      return Date.parse(second.updated_at) - Date.parse(first.updated_at)
    })
  }, [items, sortBy])

  if (items.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-800 bg-zinc-900/30 p-8 text-center">
        <p className="text-sm font-bold text-white">No Movies Found</p>
        <p className="mt-1 text-xs text-zinc-500">Add a movie from its details page or adjust your filters.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Entries ({items.length})</p>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="movie-list-sort">Sort movie list</label>
          <select className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 outline-none focus:border-red-500/60" id="movie-list-sort" onChange={(event) => setSortBy(event.target.value as SortOption)} value={sortBy}>
            <option value="date">Last updated</option>
            <option value="name">Name</option>
            <option value="rating">User rating</option>
          </select>
          <div className="flex items-center gap-1 rounded-xl border border-zinc-800 bg-zinc-900 p-1">
            <ViewButton active={viewMode === 'grid'} label="Grid view" onClick={() => setViewMode('grid')}><GridViewIcon /></ViewButton>
            <ViewButton active={viewMode === 'detailed'} label="Detailed view" onClick={() => setViewMode('detailed')}><DetailedViewIcon /></ViewButton>
            <ViewButton active={viewMode === 'compact'} label="Compact list view" onClick={() => setViewMode('compact')}><CompactViewIcon /></ViewButton>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {sortedItems.map((item) => <MoviePreferenceCard item={item} key={item.movie_id} onEdit={onEdit} />)}
        </div>
      ) : null}

      {viewMode === 'detailed' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedItems.map((item) => <DetailedMovieRow item={item} key={item.movie_id} onEdit={onEdit} />)}
        </div>
      ) : null}

      {viewMode === 'compact' ? <CompactMovieTable items={sortedItems} onEdit={onEdit} /> : null}
    </div>
  )
}

function DetailedMovieRow({ item, onEdit }: { item: MovieListItem; onEdit: (item: MovieListItem) => void }) {
  const { movie, rating, status } = item
  return (
    <article className="flex gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 transition hover:border-zinc-700 hover:bg-zinc-900">
      <Link className="relative h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-950" href={`/movies/${movie.id}`}>
        {movie.poster_url ? <Image alt={`${movie.title} poster`} className="object-cover" fill sizes="80px" src={movie.poster_url} /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div>
          <Link className="hover:text-red-300" href={`/movies/${movie.id}`}><h3 className="truncate text-base font-extrabold text-white">{movie.title}</h3></Link>
          <p className="mt-0.5 text-[11px] text-zinc-400">{movie.release_date?.slice(0, 4) ?? 'TBA'}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
          <StatusBadge status={status} />
          <div className="flex items-center gap-3">
            <Rating rating={rating} large />
            <EditButton item={item} onEdit={onEdit} />
          </div>
        </div>
      </div>
    </article>
  )
}

function CompactMovieTable({ items, onEdit }: { items: MovieListItem[]; onEdit: (item: MovieListItem) => void }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/40">
      <table className="w-full min-w-[660px] text-left text-xs text-zinc-300">
        <thead className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-bold text-zinc-500">
          <tr><th className="py-3 pl-4 pr-2">Movie</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-center">Rating</th><th className="px-3 py-3 text-right">Year</th><th className="py-3 pl-2 pr-4 text-right">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/50">
          {items.map((item) => {
            const { movie, rating, status } = item
            return (
              <tr className="transition hover:bg-zinc-800/40" key={item.movie_id}>
                <td className="py-2.5 pl-4 pr-2">
                  <Link className="flex items-center gap-3 font-semibold text-white hover:text-red-400" href={`/movies/${movie.id}`}>
                    <span className="relative h-10 w-7 shrink-0 overflow-hidden rounded-md bg-zinc-950">{movie.poster_url ? <Image alt="" className="object-cover" fill sizes="28px" src={movie.poster_url} /> : null}</span>
                    <span className="max-w-xs truncate sm:max-w-md">{movie.title}</span>
                  </Link>
                </td>
                <td className="px-3 py-2.5"><StatusBadge status={status} /></td>
                <td className="px-3 py-2.5 text-center"><Rating rating={rating} /></td>
                <td className="px-3 py-2.5 text-right font-medium text-zinc-400">{movie.release_date?.slice(0, 4) ?? 'TBA'}</td>
                <td className="py-2.5 pl-2 pr-4 text-right"><EditButton item={item} onEdit={onEdit} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function MoviePreferenceCard({ item, onEdit }: { item: MovieListItem; onEdit: (item: MovieListItem) => void }) {
  const { movie, rating, status } = item
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 shadow-md transition hover:border-zinc-700">
      <Link aria-label={`View ${movie.title}`} className="relative block aspect-[3/4] overflow-hidden bg-zinc-950" href={`/movies/${movie.id}`}>
        {movie.poster_url ? <Image alt={`${movie.title} poster`} className="object-cover transition duration-300 hover:scale-105" fill sizes="(max-width: 640px) 50vw, 180px" src={movie.poster_url} /> : null}
        <div className="absolute right-2 top-2"><StatusBadge status={status} /></div>
        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-3"><h3 className="line-clamp-2 text-sm font-extrabold leading-tight text-white">{movie.title}</h3><p className="mt-1 text-[10px] text-zinc-400">{movie.release_date?.slice(0, 4) ?? 'TBA'}</p></div>
      </Link>
      <div className="flex items-end justify-between gap-3 p-3">
        <div><p className="text-[9px] font-bold uppercase tracking-wider text-zinc-600">Your rating</p><Rating rating={rating} /></div>
        <EditButton item={item} onEdit={onEdit} />
      </div>
    </article>
  )
}

function StatusBadge({ status }: Pick<MovieListItem, 'status'>) {
  const color = status === 'completed' ? 'border-red-500/30 bg-red-950 text-red-300' : status === 'watching' ? 'border-emerald-500/30 bg-emerald-950 text-emerald-300' : 'border-zinc-700 bg-zinc-900 text-zinc-300'
  return <span className={`inline-block rounded-md border px-2 py-1 text-[9px] font-bold ${color}`}>{MOVIE_STATUS_LABELS[status]}</span>
}

function Rating({ rating, large = false }: { rating: number | null; large?: boolean }) {
  return rating ? <span className={`${large ? 'text-2xl' : 'text-lg'} font-black tracking-tight text-red-300/75`}>{rating}<span className="ml-1 text-xs text-zinc-500">/10</span></span> : <span className="text-zinc-600">—</span>
}

function EditButton({ item, onEdit }: { item: MovieListItem; onEdit: (item: MovieListItem) => void }) {
  return <button aria-label={`Edit preferences for ${item.movie.title}`} className="rounded-lg bg-red-600 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-white transition hover:bg-red-500" onClick={() => onEdit(item)} type="button">Edit</button>
}

function ViewButton({ active, children, label, onClick }: { active: boolean; children: ReactNode; label: string; onClick: () => void }) {
  return <button aria-label={label} className={`rounded-lg p-1.5 transition ${active ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-200'}`} onClick={onClick} title={label} type="button">{children}</button>
}

function GridViewIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" strokeWidth={1.8} /></svg> }
function DetailedViewIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeWidth={2} /></svg> }
function CompactViewIcon() { return <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeWidth={1.8} /></svg> }
