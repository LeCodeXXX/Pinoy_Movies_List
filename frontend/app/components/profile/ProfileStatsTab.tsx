'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ProfileStatsTabProps {
  genreBreakdown: Array<{ count: number; name: string }>
  meanScore: number
  ratingDistribution: Array<{ count: number; score: number }>
}

export default function ProfileStatsTab({
  genreBreakdown,
  meanScore,
  ratingDistribution,
}: ProfileStatsTabProps) {
  const genreColors = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa']

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Score Distribution Chart */}
      <div className="space-y-4 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md sm:rounded-3xl sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Score Distribution (1-10)
          </h2>
          <div className="text-right">
            <p className="text-2xl font-black sm:text-3xl">
              {meanScore ? meanScore.toFixed(1) : 'N/A'}
              {meanScore ? <span className="text-xs text-zinc-500"> / 10</span> : null}
            </p>
          </div>
        </div>

        <div className="h-52 pt-4" aria-label="Frequency of ratings from 1 to 10">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={ratingDistribution} margin={{ top: 20, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
              <XAxis axisLine={false} dataKey="score" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickLine={false} />
              <YAxis allowDecimals={false} hide />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`${value} rating${value === 1 ? '' : 's'}`, 'Frequency']}
                labelFormatter={(label) => `${label}/10`}
                cursor={{ fill: '#27272a', opacity: 0.35 }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="count" fill="#a1a1aa" fontSize={10} position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Favorite Genres Breakdown */}
      <div className="space-y-5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md sm:rounded-3xl sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
              Genre Overview
            </h2>
            <p className="mt-1.5 text-xs text-zinc-500">
              See which kinds of movies appear most in your collection.
            </p>
          </div>
          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-[10px] font-bold text-zinc-400">
            {genreBreakdown.length} genres
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {genreBreakdown.map(({ count, name }, index) => {
            const color = genreColors[index % genreColors.length]

            return (
              <article
                key={name}
                className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 transition hover:border-zinc-700 sm:gap-4 sm:rounded-2xl sm:p-4"
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-zinc-900 text-xl sm:h-12 sm:w-12 sm:rounded-2xl sm:text-2xl"
                  style={{ borderColor: `${color}55` }}
                >
                  {getGenreIcon(name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-bold text-white">{name}</h3>
                  <p className="mt-1 text-[10px] text-zinc-500">
                    {count} {count === 1 ? 'movie' : 'movies'} in your collection
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-black" style={{ color }}>{count}</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                    titles
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const genreIcons: Record<string, string> = {
  Action: '⚡',
  Adventure: '🧭',
  Animation: '🎨',
  Comedy: '☺',
  Crime: '🔍',
  Documentary: '🎥',
  Drama: '🎭',
  Family: '✨',
  Fantasy: '🪄',
  History: '🏛',
  Horror: '☠',
  Music: '♫',
  Mystery: '🕵',
  Romance: '♥',
  'Science Fiction': '🚀',
  Thriller: '⚠',
  War: '🛡',
  Western: '🤠',
}

function getGenreIcon(name: string) {
  return genreIcons[name] ?? '🎬'
}
