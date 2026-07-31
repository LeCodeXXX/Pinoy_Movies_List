'use client'

export type ProfileTabKey =
  | 'overview'
  | 'movielist'
  | 'favorites'
  | 'reviews'
  | 'settings'

interface ProfileNavBarProps {
  activeTab: ProfileTabKey
  onTabChange: (tab: ProfileTabKey) => void
}

export default function ProfileNavBar({
  activeTab,
  onTabChange,
}: ProfileNavBarProps) {
  const tabs: Array<{ id: ProfileTabKey; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'movielist', label: 'Movie List' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Profile navigation"
          className="flex gap-6 overflow-x-auto scrollbar-none sm:justify-center"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                aria-selected={isActive}
                className={`relative py-3.5 text-sm font-bold transition duration-200 ${isActive
                  ? 'text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-white shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
