'use client'

import { useRouter } from 'next/navigation'

export default function BackToMovies({ className = '' }: { className?: string }) {
  const router = useRouter()

  const goBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <button
      className={`group inline-flex items-center gap-3 text-sm font-bold text-zinc-400 transition hover:text-white focus-visible:outline-none ${className}`}
      onClick={goBack}
      type="button"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/40 bg-red-600 text-white shadow-lg shadow-red-950/30 transition group-hover:-translate-x-1 group-hover:bg-red-500 group-focus-visible:ring-2 group-focus-visible:ring-red-400 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-zinc-950">
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
      </span>
      <span>Back to movies</span>
    </button>
  )
}
