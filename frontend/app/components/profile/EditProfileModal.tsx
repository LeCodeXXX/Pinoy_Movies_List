'use client'

import { useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { updateProfile } from '@/app/services/authApi'
import type { AuthUser } from '@/app/types/auth'

interface EditProfileModalProps {
  onClose: () => void
  onSuccess: (updatedUser: AuthUser) => void
  user: AuthUser
}

const inputClassName =
  'mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40'

export default function EditProfileModal({
  onClose,
  onSuccess,
  user,
}: EditProfileModalProps) {
  const [displayName, setDisplayName] = useState(user.display_name)
  const [profilePicture, setProfilePicture] = useState(
    user.profile_picture ?? '',
  )
  const [bannerPicture, setBannerPicture] = useState(
    user.banner_picture ?? '',
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const response = await updateProfile(user.id, {
        display_name: displayName.trim(),
        profile_picture: profilePicture.trim() || null,
      })
      onSuccess({
        ...response.user,
        banner_picture: bannerPicture.trim() || null,
      })
      onClose()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update profile.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        aria-labelledby="edit-profile-title"
        aria-modal="true"
        className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl shadow-black sm:p-7"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div>
            <h2
              className="mt-1 text-2xl font-extrabold text-white"
              id="edit-profile-title"
            >
              Edit Profile
            </h2>
          </div>
          <button
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
            onClick={onClose}
            type="button"
          >
            <span className="text-xl">×</span>
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-zinc-300">
            Display Name
            <input
              className={inputClassName}
              maxLength={80}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              required
              value={displayName}
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-300">
            Profile Picture URL (Optional)
            <input
              className={inputClassName}
              onChange={(e) => setProfilePicture(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              type="url"
              value={profilePicture}
            />
          </label>

          <label className="block text-xs font-semibold text-zinc-300">
            Banner Image URL (Optional)
            <input
              className={inputClassName}
              onChange={(e) => setBannerPicture(e.target.value)}
              placeholder="https://example.com/profile-cover.jpg"
              type="url"
              value={bannerPicture}
            />
            <span className="mt-1.5 block text-[10px] font-normal leading-relaxed text-zinc-500">
              Wide landscape images work best. The image is shown with low opacity.
            </span>
          </label>

          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-950/30 px-3 py-2.5 text-xs text-red-300">
              {error}
            </p>
          ) : null}

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              className="rounded-xl border border-zinc-800 px-4 py-2.5 text-xs font-semibold text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-500 disabled:opacity-50"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
