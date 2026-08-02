'use client'

import Image from 'next/image'
import { useEffect, useState, type FormEvent } from 'react'
import { saveMoviePreference } from '@/app/services/moviePreferenceApi'
import type { MovieDetail, MovieSummary } from '@/app/types/movie'
import type { MovieListStatus, MoviePreference } from '@/app/types/moviePreference'

type MovieForPreference = Pick<
  MovieSummary | MovieDetail,
  'id' | 'poster_url' | 'release_date' | 'title'
>

interface MoviePreferenceModalProps {
  existingPreference: MoviePreference | null
  isOpen: boolean
  movie: MovieForPreference | null
  onClose: () => void
  onSaved: (preference: MoviePreference) => void
  userId: string
}

export default function MoviePreferenceModal({
  existingPreference,
  isOpen,
  movie,
  onClose,
  onSaved,
  userId,
}: MoviePreferenceModalProps) {
  const [status, setStatus] = useState<MovieListStatus>(
    existingPreference?.status ?? 'plan_to_watch',
  )
  const [rating, setRating] = useState(
    existingPreference?.rating?.toString() ?? '',
  )
  const [isFavorite, setIsFavorite] = useState(
    existingPreference?.is_favorite ?? false,
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSaving) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isSaving, onClose])

  if (!isOpen || !movie) return null

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!movie) return
    setIsSaving(true)
    setError(null)
    try {
      const savedPreference = await saveMoviePreference(userId, movie.id, {
        is_favorite: isFavorite,
        rating: rating ? Number(rating) : null,
        status,
      })
      onSaved(savedPreference)
      onClose()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save this movie.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      aria-labelledby="movie-preference-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
      role="dialog"
    >
      <form className="w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl" onSubmit={handleSubmit}>
        <div className="flex gap-4 border-b border-zinc-800 p-4 sm:p-5">
          <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-900 sm:w-24">
            {movie.poster_url ? (
              <Image alt={`${movie.title} poster`} className="object-cover" fill sizes="96px" src={movie.poster_url} />
            ) : (
              <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-zinc-600">No poster</div>
            )}
          </div>
          <div className="min-w-0 flex-1 py-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">My movie list</p>
            <h2 className="mt-1 line-clamp-2 text-xl font-extrabold text-white" id="movie-preference-title">{movie.title}</h2>
            <p className="mt-1 text-xs text-zinc-500">{movie.release_date?.slice(0, 4) ?? 'Release date TBA'}</p>
          </div>
          <button aria-label="Close movie list editor" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xl text-zinc-500 transition hover:bg-zinc-900 hover:text-white" disabled={isSaving} onClick={onClose} type="button">×</button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-zinc-300">Movie status</span>
            <select className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500" onChange={(event) => setStatus(event.target.value as MovieListStatus)} value={status}>
              <option value="plan_to_watch">Plan to Watch</option>
              <option value="watching">Watching</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-zinc-300">Your rating</span>
            <select className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-3 text-sm font-semibold text-white outline-none focus:border-blue-500" onChange={(event) => setRating(event.target.value)} value={rating}>
              <option value="">Not rated</option>
              {Array.from({ length: 19 }, (_, index) => (index + 2) / 2).map((score) => (
                <option key={score} value={score}>{score} / 10</option>
              ))}
            </select>
          </label>
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
            <span>
              <span className="block text-sm font-bold text-white">Favorite movie</span>
              <span className="mt-0.5 block text-[11px] text-zinc-500">Show this movie in your favorites.</span>
            </span>
            <input checked={isFavorite} className="h-5 w-5 accent-blue-600" onChange={(event) => setIsFavorite(event.target.checked)} type="checkbox" />
          </label>
          {error ? <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p> : null}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-800 bg-zinc-900/40 px-4 py-3 sm:px-5">
          <button className="rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white" disabled={isSaving} onClick={onClose} type="button">Cancel</button>
          <button className="min-w-28 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-blue-500 disabled:opacity-60" disabled={isSaving} type="submit">
            {isSaving ? 'Saving…' : existingPreference ? 'Save Changes' : 'Add to List'}
          </button>
        </div>
      </form>
    </div>
  )
}
