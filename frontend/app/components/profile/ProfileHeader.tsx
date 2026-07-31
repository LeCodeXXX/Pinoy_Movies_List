'use client'

import type { AuthUser } from '@/app/types/auth'

interface ProfileHeaderProps {
  onEditClick: () => void
  stats: {
    favoritesCount: number
    ratingsCount: number
    reviewsCount: number
    watchedCount: number
  }
  user: AuthUser
}

export default function ProfileHeader({
  onEditClick,
  stats,
  user,
}: ProfileHeaderProps) {
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })
    : 'Recently'

  return (
    <header className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 via-zinc-900/60 to-zinc-950 p-6 shadow-2xl backdrop-blur-md sm:p-8">
      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-red-900/10 blur-3xl"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* User Identity Info */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {/* Avatar / Initials Halo */}
          <div className="relative group shrink-0">
            {user.profile_picture ? (
              <img
                alt={user.display_name}
                className="h-24 w-24 rounded-full border-2 border-red-500/40 object-cover shadow-xl shadow-red-950/20 transition duration-300 group-hover:border-red-500"
                src={user.profile_picture}
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-red-500/40 bg-gradient-to-br from-red-950 via-zinc-900 to-zinc-950 text-3xl font-black uppercase text-red-200 shadow-xl shadow-red-950/30 transition duration-300 group-hover:border-red-500">
                {getInitials(user.display_name)}
              </div>
            )}
            <span
              aria-label="Verified user"
              className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-zinc-950 bg-red-600 text-[10px] text-white shadow-md"
              title="Verified Cinephile"
            >
              ✓
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {user.display_name}
              </h1>
              <span className="rounded-full border border-red-500/30 bg-red-950/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
                Cinephile Member
              </span>
            </div>

            <p className="text-sm font-medium text-zinc-400">@{user.username}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5">
                <MailIcon />
                {user.email}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center gap-1.5">
                <CalendarIcon />
                Joined {memberSince}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-bold text-zinc-200 shadow-md transition hover:border-red-500/50 hover:bg-zinc-800 hover:text-white"
            onClick={onEditClick}
            type="button"
          >
            <EditIcon />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Quick Statistics Bar */}
      <div className="relative mt-8 grid grid-cols-2 gap-3 border-t border-zinc-800/80 pt-6 sm:grid-cols-4 lg:gap-4">
        <StatCard label="Favorites" icon={<HeartIcon />} value={stats.favoritesCount} />
        <StatCard label="Watched" icon={<EyeIcon />} value={stats.watchedCount} />
        <StatCard label="Rated" icon={<StarIcon />} value={stats.ratingsCount} />
        <StatCard label="Reviews" icon={<MessageIcon />} value={stats.reviewsCount} />
      </div>
    </header>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-3.5 transition hover:border-zinc-700/80">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-950/30 text-red-400">
        {icon}
      </div>
      <div>
        <p className="text-lg font-black text-white">{value}</p>
        <p className="text-[11px] font-semibold text-zinc-400">{label}</p>
      </div>
    </div>
  )
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

function EditIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function MessageIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
