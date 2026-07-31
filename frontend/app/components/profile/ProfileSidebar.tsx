'use client'

export type ListCategoryFilter = 'all' | 'completed' | 'watching' | 'plantowatch'

interface ProfileSidebarProps {
  availableGenres: string[]
  availableYears: string[]
  filterQuery: string
  onCategoryChange: (category: ListCategoryFilter) => void
  onGenreChange: (genre: string) => void
  onQueryChange: (query: string) => void
  onYearChange: (year: string) => void
  selectedCategory: ListCategoryFilter
  selectedGenre: string
  selectedYear: string
  stats: {
    completedCount: number
    meanScore: number
    totalCount: number
    watchingCount: number
  }
}

export default function ProfileSidebar({
  availableGenres,
  availableYears,
  filterQuery,
  onCategoryChange,
  onGenreChange,
  onQueryChange,
  onYearChange,
  selectedCategory,
  selectedGenre,
  selectedYear,
  stats,
}: ProfileSidebarProps) {
  const categories: Array<{ id: ListCategoryFilter; label: string }> = [
    { id: 'all', label: 'All Movies' },
    { id: 'completed', label: 'Completed' },
    { id: 'watching', label: 'Watching' },
    { id: 'plantowatch', label: 'Plan to Watch' },
  ]

  return (
    <aside className="w-full space-y-6 lg:w-64 shrink-0">
      {/* Search Filter Box */}
      <div className="relative">
        <span aria-hidden="true" className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
          <SearchIcon />
        </span>
        <input
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 outline-none transition focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40"
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Filter movies…"
          type="text"
          value={filterQuery}
        />
      </div>

      {/* Lists / Categories */}
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Lists
        </p>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                className={`w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${isActive
                  ? 'bg-zinc-800 text-white shadow-sm font-bold'
                  : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-zinc-200'
                  }`}
                onClick={() => onCategoryChange(cat.id)}
                type="button"
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Dropdown Filters */}
      <div className="space-y-3.5 pt-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Filters
        </p>

        {/* Genre Filter */}
        <label className="block space-y-1 text-xs font-semibold text-zinc-400">
          Genres & Tags
          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white outline-none transition focus:border-red-500/60"
            onChange={(e) => onGenreChange(e.target.value)}
            value={selectedGenre}
          >
            <option value="all">All Genres</option>
            {availableGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        {/* Year Filter */}
        <label className="block space-y-1 text-xs font-semibold text-zinc-400">
          Release Year
          <select
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-3 py-2 text-xs text-white outline-none transition focus:border-red-500/60"
            onChange={(e) => onYearChange(e.target.value)}
            value={selectedYear}
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Quick Stats Sidebar Widget */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
          Quick Stats
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
            <p className="text-base font-extrabold text-white">{stats.totalCount}</p>
            <p className="text-[10px] text-zinc-500">Total Entries</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2.5">
            <p className="text-base font-extrabold">
              {stats.meanScore ? stats.meanScore.toFixed(1) : 'N/A'}
            </p>
            <p className="text-[10px] text-zinc-500">Mean Score</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function SearchIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
