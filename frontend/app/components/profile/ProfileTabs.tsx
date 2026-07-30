'use client'

export type ProfileTabKey = 'favorites' | 'watched' | 'ratings' | 'reviews' | 'settings'

interface ProfileTabsProps {
  activeTab: ProfileTabKey
  counts: {
    favorites: number
    ratings: number
    reviews: number
    watched: number
  }
  onTabChange: (tab: ProfileTabKey) => void
}

export default function ProfileTabs({
  activeTab,
  counts,
  onTabChange,
}: ProfileTabsProps) {
  const tabs: Array<{
    count: number
    icon: React.ReactNode
    id: ProfileTabKey
    label: string
  }> = [
    {
      count: counts.favorites,
      icon: <HeartIcon />,
      id: 'favorites',
      label: 'Favorites',
    },
    {
      count: counts.watched,
      icon: <EyeIcon />,
      id: 'watched',
      label: 'Watched',
    },
    {
      count: counts.ratings,
      icon: <StarIcon />,
      id: 'ratings',
      label: 'My Ratings',
    },
    {
      count: counts.reviews,
      icon: <MessageIcon />,
      id: 'reviews',
      label: 'Reviews',
    },
    {
      count: 0,
      icon: <CogIcon />,
      id: 'settings',
      label: 'Settings',
    },
  ]

  return (
    <nav className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-1.5 backdrop-blur-md scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            aria-selected={isActive}
            className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              isActive
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700'
                : 'text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200'
            }`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            type="button"
          >
            <span className={isActive ? 'text-red-400' : 'text-zinc-500'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>
            {tab.id !== 'settings' ? (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive
                    ? 'bg-red-950 text-red-300 border border-red-500/30'
                    : 'bg-zinc-950 text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        )
      })}
    </nav>
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

function CogIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
      <path
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
      />
    </svg>
  )
}
