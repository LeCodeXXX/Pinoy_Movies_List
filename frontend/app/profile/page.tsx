'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import MoviePreferenceModal from '@/app/components/movie-preferences/MoviePreferenceModal'
import EditProfileModal from '@/app/components/profile/EditProfileModal'
import FavoritesTab from '@/app/components/profile/FavoritesTab'
import MovieListTab, {
  type MovieListItem,
} from '@/app/components/profile/MovieListTab'
import ProfileBanner from '@/app/components/profile/ProfileBanner'
import ProfileNavBar, {
  type ProfileTabKey,
} from '@/app/components/profile/ProfileNavBar'
import ProfileOverviewTab from '@/app/components/profile/ProfileOverviewTab'
import ProfileSidebar, {
  type ListCategoryFilter,
} from '@/app/components/profile/ProfileSidebar'
import ReviewsTab, {
  type UserReviewItem,
} from '@/app/components/profile/ReviewsTab'
import { getMovieGenreName, movieGenreNames } from '@/app/constants/movieGenres'
import {
  getMoviePreferences,
  saveMoviePreference,
} from '@/app/services/moviePreferenceApi'
import type { AuthUser } from '@/app/types/auth'

const AUTH_USER_STORAGE_KEY = 'pinoy-cinema-auth-user'

export default function UserProfile() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [activeTab, setActiveTab] = useState<ProfileTabKey>('overview')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingPreference, setEditingPreference] =
    useState<MovieListItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters state
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedCategory, setSelectedCategory] =
    useState<ListCategoryFilter>('all')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')

  const [movieListItems, setMovieListItems] = useState<MovieListItem[]>([])
  const userReviews: UserReviewItem[] = []

  useEffect(() => {
    const controller = new AbortController()
    async function loadProfile() {
      await Promise.resolve()
      const storedUser = window.localStorage.getItem(AUTH_USER_STORAGE_KEY)
      if (!storedUser) {
        setIsLoading(false)
        return
      }

      let parsedUser: AuthUser
      try {
        parsedUser = JSON.parse(storedUser) as AuthUser
        setUser(parsedUser)
      } catch {
        window.localStorage.removeItem(AUTH_USER_STORAGE_KEY)
        setIsLoading(false)
        return
      }

      try {
        const response = await getMoviePreferences(parsedUser.id, controller.signal)
        setMovieListItems(response.results)
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to load saved movie preferences', error)
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [])

  const favoriteMovies = useMemo(
    () => movieListItems.filter((item) => item.is_favorite).map((item) => item.movie),
    [movieListItems],
  )

  const availableYears = useMemo(() => {
    return Array.from(
      new Set(
        movieListItems
          .map((item) => item.movie.release_date?.slice(0, 4))
          .filter((year): year is string => Boolean(year)),
      ),
    ).sort((a, b) => Number(b) - Number(a))
  }, [movieListItems])

  // Filtered movie list computation
  const filteredListItems = useMemo(() => {
    return movieListItems.filter(({ movie, status }) => {
      // Category filter
      if (
        selectedCategory === 'completed' &&
        status !== 'completed'
      )
        return false
      if (
        selectedCategory === 'watching' &&
        status !== 'watching'
      )
        return false
      if (
        selectedCategory === 'plantowatch' &&
        status !== 'plan_to_watch'
      )
        return false

      // Search query filter
      if (filterQuery.trim()) {
        const query = filterQuery.toLowerCase()
        if (!movie.title.toLowerCase().includes(query)) return false
      }

      // Year filter
      if (selectedYear !== 'all') {
        const year = movie.release_date?.slice(0, 4)
        if (year !== selectedYear) return false
      }

      if (
        selectedGenre !== 'all' &&
        !movie.genre_ids.some((genreId) => getMovieGenreName(genreId) === selectedGenre)
      ) {
        return false
      }

      return true
    })
  }, [movieListItems, selectedCategory, filterQuery, selectedGenre, selectedYear])

  const stats = useMemo(() => {
    const completedCount = movieListItems.filter(
      (i) => i.status === 'completed',
    ).length
    const watchingCount = movieListItems.filter(
      (i) => i.status === 'watching',
    ).length
    const scores = movieListItems
      .map((i) => i.rating)
      .filter((score): score is number => score !== null)

    const meanScore = scores.length
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0

    return {
      completedCount,
      meanScore,
      totalCount: movieListItems.length,
      watchingCount,
    }
  }, [movieListItems])

  const ratingDistribution = useMemo(() => {
    const dist = Array.from({ length: 10 }, (_, index) => ({
      count: 0,
      score: index + 1,
    }))
    for (const item of movieListItems) {
      if (item.rating) {
        dist[item.rating - 1].count += 1
      }
    }
    return dist
  }, [movieListItems])

  const genreBreakdown = useMemo(() => {
    const counts = new Map<string, number>()
    movieListItems.forEach(({ movie }) => {
      movie.genre_ids.forEach((genreId) => {
        const name = getMovieGenreName(genreId)
        counts.set(name, (counts.get(name) ?? 0) + 1)
      })
    })
    return Array.from(counts, ([name, count]) => ({ count, name }))
      .sort((first, second) => second.count - first.count)
      .slice(0, 6)
  }, [movieListItems])

  const handleUpdateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
    window.localStorage.setItem(
      AUTH_USER_STORAGE_KEY,
      JSON.stringify(updatedUser),
    )
  }

  const handlePreferenceSaved = (savedPreference: MovieListItem) => {
    setMovieListItems((current) => {
      const exists = current.some((item) => item.movie_id === savedPreference.movie_id)
      return exists
        ? current.map((item) =>
            item.movie_id === savedPreference.movie_id ? savedPreference : item,
          )
        : [savedPreference, ...current]
    })
  }

  const handleRemoveFavorite = (movieId: number) => {
    const preference = movieListItems.find((item) => item.movie_id === movieId)
    if (!preference || !user) return

    void saveMoviePreference(user.id, movieId, {
      is_favorite: false,
      rating: preference.rating,
      status: preference.status,
    })
      .then(handlePreferenceSaved)
      .catch((error: unknown) => console.error('Failed to remove favorite', error))
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading user profile...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100 selection:bg-blue-500 selection:text-white">
        <div className="mx-auto max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center shadow-2xl backdrop-blur-md">
          <h1 className="text-2xl font-extrabold text-white">
            Sign In Required
          </h1>
          <p className="mt-2 text-xs text-zinc-400">
            Sign in to access your custom profile dashboard, movie tracking lists, and favorites.
          </p>
          <div className="mt-6">
            <Link
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-xs font-extrabold text-white shadow-lg transition hover:bg-blue-500"
              href="/"
            >
              Return Home to Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 selection:bg-blue-500 selection:text-white">
      {/* Navigation Header Link */}
      <header className="sticky top-0 z-40 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 transition hover:text-white"
            href="/"
          >
            &larr; Back to Movies
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
            Pinoy Cinema Vault
          </p>
        </div>
      </header>

      {/* AniList-Style Hero Banner with Avatar */}
      <ProfileBanner
        onEditClick={() => setIsEditModalOpen(true)}
        user={user}
      />

      {/* AniList-Style Horizontal Tab Navigation Bar */}
      <ProfileNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main 2-Column Content Container */}
      <main className="mx-auto max-w-[1280px] px-6 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Movie-list filters are only relevant to the Movie List tab. */}
          {activeTab === 'movielist' && (
            <ProfileSidebar
              availableGenres={movieGenreNames}
              availableYears={availableYears}
              filterQuery={filterQuery}
              onCategoryChange={setSelectedCategory}
              onGenreChange={setSelectedGenre}
              onQueryChange={setFilterQuery}
              onYearChange={setSelectedYear}
              selectedCategory={selectedCategory}
              selectedGenre={selectedGenre}
              selectedYear={selectedYear}
              stats={stats}
            />
          )}

          {/* Right Main Content Panel */}
          <section className="min-h-[500px] flex-1 min-w-0">
            {activeTab === 'overview' && (
              <ProfileOverviewTab
                favoriteMovies={favoriteMovies}
                genreBreakdown={genreBreakdown}
                ratingDistribution={ratingDistribution}
                recentMovies={movieListItems.slice(0, 6).map((i) => i.movie)}
                stats={stats}
              />
            )}

            {activeTab === 'movielist' && (
              <MovieListTab items={filteredListItems} onEdit={setEditingPreference} />
            )}

            {activeTab === 'favorites' && (
              <FavoritesTab
                movies={favoriteMovies}
                onRemoveFavorite={handleRemoveFavorite}
              />
            )}

            {activeTab === 'reviews' && <ReviewsTab reviews={userReviews} />}

            {activeTab === 'settings' && (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
                <h2 className="text-lg font-bold text-white">Account Settings</h2>
                <p className="text-xs text-zinc-400">
                  Update your display name or avatar image URL.
                </p>

                <div className="space-y-3 max-w-md">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Username</p>
                    <p className="text-sm font-bold text-white">@{user.username}</p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Email Address</p>
                    <p className="text-sm font-bold text-white">{user.email}</p>
                  </div>
                  <button
                    className="rounded-xl border border-blue-500/30 bg-blue-950/30 px-4 py-2.5 text-xs font-bold text-blue-300 transition hover:bg-blue-900/50"
                    onClick={() => setIsEditModalOpen(true)}
                    type="button"
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUpdateUser}
          user={user}
        />
      )}

      {editingPreference ? (
        <MoviePreferenceModal
          existingPreference={editingPreference}
          isOpen
          movie={editingPreference.movie}
          onClose={() => setEditingPreference(null)}
          onSaved={handlePreferenceSaved}
          userId={user.id}
        />
      ) : null}
    </div>
  )
}
