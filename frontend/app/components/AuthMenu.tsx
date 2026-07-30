import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { login, signup } from '../services/authApi'
import type { AuthUser } from '../types/auth'

type AuthMode = 'login' | 'signup'

const AUTH_USER_STORAGE_KEY = 'pinoy-cinema-auth-user'
const inputClassName =
  'mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40'

export default function AuthMenu() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mode, setMode] = useState<AuthMode>('login')
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
    if (!storedUser) return

    try {
      const parsedUser: unknown = JSON.parse(storedUser)
      if (!isAuthUser(parsedUser)) {
        window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
        return
      }

      const restoreUser = window.setTimeout(() => setUser(parsedUser), 0)
      return () => window.clearTimeout(restoreUser)
    } catch {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isOpen])

  const openAuth = () => {
    setError(null)
    setMode('login')
    setIsOpen(true)
  }

  const logout = () => {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
    setUser(null)
  }

  const switchMode = (nextMode: AuthMode) => {
    setError(null)
    setMode(nextMode)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    setError(null)
    setIsSubmitting(true)

    try {
      const response =
        mode === 'login'
          ? await login({
              identifier: String(fields.get('identifier') ?? ''),
              password: String(fields.get('password') ?? ''),
            })
          : await signup({
              display_name: String(fields.get('displayName') ?? ''),
              email: String(fields.get('email') ?? ''),
              password: String(fields.get('password') ?? ''),
              username: String(fields.get('username') ?? ''),
            })

      window.localStorage.setItem(
        AUTH_USER_STORAGE_KEY,
        JSON.stringify(response.user),
      )
      setUser(response.user)
      setIsOpen(false)
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to authenticate. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="order-2 ml-auto flex shrink-0 items-center gap-2 border-l border-zinc-800 pl-3 lg:order-none lg:ml-0">
        {user ? (
          <>
            <Link
              className="flex items-center gap-2.5 rounded-xl p-1 transition hover:bg-zinc-800/60"
              href="/profile"
              title="View Profile"
            >
              <div className="hidden max-w-28 text-right sm:block">
                <p className="truncate text-xs font-bold text-zinc-200">
                  {user.display_name}
                </p>
                <p className="mt-0.5 truncate text-[10px] text-zinc-500">
                  @{user.username}
                </p>
              </div>
              {user.profile_picture ? (
                <img
                  alt={user.display_name}
                  className="h-9 w-9 rounded-full border border-red-500/30 object-cover"
                  src={user.profile_picture}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-red-500/30 bg-red-950 text-xs font-black uppercase text-red-200"
                >
                  {getInitials(user.display_name)}
                </span>
              )}
            </Link>
            <button
              className="rounded-lg border border-zinc-800 px-2.5 py-2 text-[11px] font-semibold text-zinc-400 transition hover:border-zinc-700 hover:text-white"
              onClick={logout}
              type="button"
            >
              Log out
            </button>
          </>
        ) : (

          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-red-600 px-3.5 text-xs font-bold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-500"
            onClick={openAuth}
            type="button"
          >
            <UserIcon />
            Sign in
          </button>
        )}
      </div>

      {isOpen && typeof document !== 'undefined' ? createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <section
            aria-labelledby="auth-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black sm:p-6"
            role="dialog"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400">
                  Pinoy Cinema Vault
                </p>
                <h2
                  className="mt-1 text-2xl font-extrabold text-white"
                  id="auth-title"
                >
                  {mode === 'login' ? 'Welcome back' : 'Create an account'}
                </h2>
              </div>
              <button
                aria-label="Close authentication dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-white"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <span aria-hidden="true" className="text-xl">×</span>
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl bg-zinc-950 p-1">
              <ModeButton
                active={mode === 'login'}
                onClick={() => switchMode('login')}
              >
                Log in
              </ModeButton>
              <ModeButton
                active={mode === 'signup'}
                onClick={() => switchMode('signup')}
              >
                Sign up
              </ModeButton>
            </div>

            <form className="mt-5 space-y-4" key={mode} onSubmit={handleSubmit}>
              {mode === 'signup' ? (
                <>
                  <label className="block text-xs font-semibold text-zinc-300">
                    Display name
                    <input
                      autoComplete="name"
                      className={inputClassName}
                      maxLength={80}
                      name="displayName"
                      placeholder="Juan Dela Cruz"
                      required
                    />
                  </label>
                  <label className="block text-xs font-semibold text-zinc-300">
                    Username
                    <input
                      autoComplete="username"
                      className={inputClassName}
                      maxLength={30}
                      minLength={3}
                      name="username"
                      pattern="[A-Za-z0-9_]+"
                      placeholder="juan_delacruz"
                      required
                    />
                  </label>
                  <label className="block text-xs font-semibold text-zinc-300">
                    Email
                    <input
                      autoComplete="email"
                      className={inputClassName}
                      name="email"
                      placeholder="juan@example.com"
                      required
                      type="email"
                    />
                  </label>
                </>
              ) : (
                <label className="block text-xs font-semibold text-zinc-300">
                  Username or email
                  <input
                    autoComplete="username"
                    autoFocus
                    className={inputClassName}
                    minLength={3}
                    name="identifier"
                    placeholder="juan_delacruz"
                    required
                  />
                </label>
              )}

              <label className="block text-xs font-semibold text-zinc-300">
                Password
                <input
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  className={inputClassName}
                  minLength={mode === 'signup' ? 8 : 1}
                  name="password"
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                  required
                  type="password"
                />
              </label>

              {error ? (
                <p
                  aria-live="polite"
                  className="rounded-xl border border-red-500/20 bg-red-950/30 px-3 py-2.5 text-xs text-red-300"
                >
                  {error}
                </p>
              ) : null}

              <button
                className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting
                  ? 'Please wait…'
                  : mode === 'login'
                    ? 'Log in'
                    : 'Create account'}
              </button>
            </form>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  )
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
        active ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-200'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        d="M20 21a8 8 0 00-16 0m8-10a4 4 0 100-8 4 4 0 000 8z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
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

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AuthUser>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.username === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.display_name === 'string'
  )
}
