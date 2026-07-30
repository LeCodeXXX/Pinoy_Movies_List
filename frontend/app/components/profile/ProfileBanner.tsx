'use client'

import type { AuthUser } from '@/app/types/auth'

interface ProfileBannerProps {
  onEditClick: () => void
  user: AuthUser
}

export default function ProfileBanner({
  onEditClick,
  user,
}: ProfileBannerProps) {
  return (
    <div className="relative w-full bg-zinc-950">
      {/* Full-Width Cover Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-zinc-900 sm:h-64 md:h-72">
        {user.banner_picture ? (
          <div
            aria-label={`${user.display_name}'s profile banner`}
            className="absolute inset-0 bg-cover bg-center opacity-30"
            role="img"
            style={{
              backgroundImage: `url(${JSON.stringify(user.banner_picture)})`,
            }}
          />
        ) : null}
        {/* Background glow and subtle ambient pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-red-900/10 to-transparent"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-zinc-950"
        />
        <button
          className="absolute right-4 top-4 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-[10px] font-bold text-white/70 backdrop-blur-sm transition hover:bg-black/70 hover:text-white sm:right-6"
          onClick={onEditClick}
          type="button"
        >
          Change cover
        </button>
      </div>

      {/* Hero Content Section (Overlapping Avatar & User Info) */}
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 flex flex-col items-start gap-4 pb-4 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6">
          {/* Overlapping Avatar */}
          <div className="relative group shrink-0">
            {user.profile_picture ? (
              <img
                alt={user.display_name}
                className="h-28 w-28 rounded-2xl border-4 border-zinc-950 object-cover shadow-2xl transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36"
                src={user.profile_picture}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-zinc-950 bg-gradient-to-br from-indigo-900 via-blue-950 to-zinc-900 text-4xl font-black uppercase text-blue-200 shadow-2xl transition duration-300 group-hover:scale-105 sm:h-36 sm:w-36">
                {getInitials(user.display_name)}
              </div>
            )}
            <span
              aria-label="Verified user"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-zinc-950 bg-blue-500 text-xs font-bold text-white shadow-lg"
              title="Verified Cinephile"
            >
              ✓
            </span>
          </div>

          {/* Display Name & Handle */}
          <div className="mb-1 space-y-1 sm:mb-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {user.display_name}
            </h1>
            <p className="text-sm font-medium text-zinc-400">@{user.username}</p>
          </div>

          {/* Edit Profile Button */}
          <button
            className="mb-2 ml-auto inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/90 px-4 py-2.5 text-xs font-bold text-zinc-300 shadow-lg backdrop-blur-md transition hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            onClick={onEditClick}
            type="button"
          >
            <EditIcon />
            Edit Profile
          </button>
        </div>
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
