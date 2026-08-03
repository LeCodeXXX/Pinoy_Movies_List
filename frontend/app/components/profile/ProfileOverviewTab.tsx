'use client'

import MovieCard from '@/app/components/MovieCard'
import ProfileStatsTab from '@/app/components/profile/ProfileStatsTab'
import type { MovieSummary } from '@/app/types/movie'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface ProfileOverviewTabProps {
  favoriteMovies: MovieSummary[]
  genreBreakdown: Array<{ count: number; name: string }>
  ratingDistribution: Array<{ count: number; score: number }>
  recentMovies: MovieSummary[]
  stats: {
    completedCount: number
    meanScore: number
    totalCount: number
    watchingCount: number
  }
}

export default function ProfileOverviewTab({
  favoriteMovies,
  genreBreakdown,
  ratingDistribution,
  recentMovies,
  stats,
}: ProfileOverviewTabProps) {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Compact capsule KPI charts */}
      <section aria-labelledby="activity-dashboard-title" className="space-y-4">
        <div className="flex items-end justify-between gap-4 border-b border-zinc-800/80 pb-2">
          <div>
            <h2
              className="mt-1 text-base font-extrabold text-white sm:text-lg"
              id="activity-dashboard-title"
            >
              Profile snapshot
            </h2>
          </div>
        </div>

        <StatusCapsuleChart
          completedCount={stats.completedCount}
          totalCount={stats.totalCount}
          watchingCount={stats.watchingCount}
        />
      </section>

      <div className="pb-2 sm:pb-6">
        <ProfileStatsTab
          genreBreakdown={genreBreakdown}
          meanScore={stats.meanScore}
          ratingDistribution={ratingDistribution}
        />
      </div>

      {/* Favorite Movies Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Favorite Movies
          </h2>
          <span className="text-xs text-zinc-500">{favoriteMovies.length} Favorites</span>
        </div>

        {favoriteMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {favoriteMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No favorite movies added yet.</p>
        )}
      </div>

      {/* Recent Activity Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Recent Activity
          </h2>
        </div>

        {recentMovies.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {recentMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-500">No recent activity.</p>
        )}
      </div>
    </div>
  )
}

function StatusCapsuleChart({
  completedCount,
  totalCount,
  watchingCount,
}: {
  completedCount: number
  totalCount: number
  watchingCount: number
}) {
  const planToWatchCount = Math.max(
    totalCount - completedCount - watchingCount,
    0,
  )
  const statuses = [
    { color: '#34d399', count: completedCount, label: 'Completed' },
    { color: '#fbbf24', count: watchingCount, label: 'Watching' },
    { color: '#60a5fa', count: planToWatchCount, label: 'Plan to Watch' },
  ]
  const chartData = [{
    name: 'Movies',
    completed: completedCount,
    watching: watchingCount,
    planToWatch: planToWatchCount,
  }]

  return (
          <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 sm:rounded-2xl sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-200">Movie status</h3>
          <p className="mt-1 text-[10px] text-zinc-500">
            Compare how your movie list is distributed.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-black text-white">{totalCount}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-500">
            Total movies
          </p>
        </div>
      </div>

      <div
        aria-label={`Movie statuses: ${completedCount} completed, ${watchingCount} watching, ${planToWatchCount} plan to watch`}
        className="mt-5 h-14"
        role="img"
      >
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
            <XAxis axisLine={false} domain={[0, Math.max(totalCount, 1)]} hide type="number" />
            <YAxis dataKey="name" hide type="category" />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
              formatter={(value, name) => [`${value} movie${value === 1 ? '' : 's'}`, name]}
              cursor={{ fill: '#27272a', opacity: 0.25 }}
            />
            <Bar dataKey="completed" fill="#34d399" radius={[999, 0, 0, 999]} stackId="status" />
            <Bar dataKey="watching" fill="#fbbf24" stackId="status" />
            <Bar dataKey="planToWatch" fill="#60a5fa" radius={[0, 999, 999, 0]} stackId="status" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {statuses.map((status) => (
          <div
            key={status.label}
            className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 px-3 py-2"
          >
            <span className="flex min-w-0 items-center gap-2 text-[10px] font-semibold text-zinc-400">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="truncate">{status.label}</span>
            </span>
            <span className="text-sm font-black text-white">{status.count}</span>
          </div>
        ))}
      </div>
    </article>
  )
}
