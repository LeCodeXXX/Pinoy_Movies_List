'use client'

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
  const maxRatingCount = Math.max(...ratingDistribution.map((d) => d.count), 1)
  const maxGenreCount = Math.max(...genreBreakdown.map((genre) => genre.count), 1)
  const genreColors = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa']

  return (
    <div className="space-y-8">
      {/* Score Distribution Chart */}
      <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
            Score Distribution (1-10)
          </h2>
          <div className="rounded-xl border border-blue-500/20 bg-blue-950/30 px-3 py-2 text-right">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
              Average given
            </p>
            <p className="text-lg font-black text-blue-300">
              {meanScore ? meanScore.toFixed(1) : 'N/A'}
              {meanScore ? <span className="text-xs text-zinc-500"> / 10</span> : null}
            </p>
          </div>
        </div>

        <div className="flex h-44 items-end gap-2 pt-4">
          {ratingDistribution.map(({ count, score }) => {
            const heightPercent = (count / maxRatingCount) * 100
            return (
              <div
                key={score}
                className="flex flex-1 flex-col items-center gap-2 group h-full justify-end"
              >
                <span className="text-[10px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition">
                  {count}
                </span>
                <div
                  className="w-full rounded-t-lg bg-blue-600 transition duration-300 group-hover:bg-blue-500"
                  style={{ height: `${Math.max(heightPercent, 4)}%` }}
                />
                <span className="text-xs font-bold text-zinc-400">{score}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Favorite Genres Breakdown */}
      <div className="space-y-5 rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 backdrop-blur-md">
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
            const differenceFromLeader = maxGenreCount - count

            return (
              <article
                key={name}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-zinc-700"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-black"
                      style={{ borderColor: `${color}55`, color }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-white">
                        {name}
                      </h3>
                      <p className="mt-0.5 text-[10px] text-zinc-500">
                        Collection activity
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black text-white">{count}</p>
                    <p className="text-[9px] text-zinc-500">
                      {count === 1 ? 'movie' : 'movies'}
                    </p>
                  </div>
                </div>

                <div
                  aria-label={`${name}: ${count} movies`}
                  aria-valuemax={maxGenreCount}
                  aria-valuemin={0}
                  aria-valuenow={count}
                  className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800"
                  role="progressbar"
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: color,
                      width: `${(count / maxGenreCount) * 100}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-right text-[9px] font-semibold text-zinc-600">
                  {differenceFromLeader === 0
                    ? 'Top genre'
                    : `${differenceFromLeader} behind the leader`}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
