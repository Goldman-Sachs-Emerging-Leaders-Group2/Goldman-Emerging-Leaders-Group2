const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    ),
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 6.5h16" />
        <path d="M4 12h16" />
        <path d="M4 17.5h10" />
      </svg>
    ),
  },
  {
    id: 'results',
    label: 'Results',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 18V9" />
        <path d="M12 18V6" />
        <path d="M19 18v-4" />
      </svg>
    ),
  },
  {
    id: 'saved',
    label: 'Saved',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
      </svg>
    ),
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H20v16H5.5A2.5 2.5 0 0 0 3 21.5z" />
        <path d="M8 7h8" />
        <path d="M8 11h8" />
      </svg>
    ),
  },
]

export default function Sidebar({ activeView, onNavigate, savedCount, onNewAnalysis, hasResults }) {
  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--bg)]/88 shadow-[0_10px_24px_rgba(17,27,40,0.08)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3 lg:px-8">
        <nav className="flex flex-1 gap-2 overflow-x-auto overflow-y-visible py-1.5 pr-1" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id
            const isDisabled = item.id === 'results' && !hasResults

            return (
              <button
                key={item.id}
                type="button"
                className={[
                  'northline-tab',
                  'inline-flex shrink-0 items-center gap-2 whitespace-nowrap',
                  isActive ? 'is-active' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                disabled={isDisabled}
                title={isDisabled ? 'Run a comparison to unlock results' : item.label}
              >
                <span className="h-4 w-4 shrink-0 [&_svg]:h-4 [&_svg]:w-4">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.id === 'saved' && savedCount > 0 && (
                  <span className="rounded-full bg-[color:var(--navy)] px-2 py-0.5 text-[0.72rem] font-semibold text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <button
          type="button"
          className="northline-button-secondary hidden sm:inline-flex"
          onClick={onNewAnalysis}
        >
          New plan
        </button>
      </div>
    </div>
  )
}
