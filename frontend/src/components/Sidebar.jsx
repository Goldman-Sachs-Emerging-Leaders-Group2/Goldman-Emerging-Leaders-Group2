const NAV_ITEMS = [
  { id: 'results', label: 'Results', icon: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
    </svg>
  )},
  { id: 'history', label: 'History', icon: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" />
    </svg>
  )},
  { id: 'ai', label: 'AI Advisor', disabled: true, icon: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93" />
      <path d="M8.56 13.44A6 6 0 0 0 12 22a6 6 0 0 0 3.44-8.56" />
      <path d="M14.5 4.5L18 2" /><path d="M9.5 4.5L6 2" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )},
]

export default function Sidebar({ activeView, onNavigate, savedCount, onNewAnalysis }) {
  return (
    <aside
      className={[
        'w-[210px] h-[calc(100vh-60px)] fixed top-[60px] left-0 z-50',
        'bg-[var(--sidebar-bg,#00244D)]',
        'border-r border-r-[var(--sidebar-border,rgba(181,152,90,0.15))]',
        'pt-6 pb-4 shrink-0 flex flex-col overflow-y-auto',
        'animate-[sidebarSlideIn_0.85s_cubic-bezier(0.16,1,0.3,1)_both]',
        // Mobile: bottom nav bar
        'max-md:w-full max-md:h-auto max-md:fixed max-md:top-auto max-md:bottom-0',
        'max-md:left-0 max-md:right-0 max-md:z-100',
        'max-md:flex-row max-md:p-0 max-md:border-r-0',
        'max-md:border-t max-md:border-t-[var(--sidebar-border,rgba(181,152,90,0.15))]',
        'max-md:overflow-y-visible',
        'max-md:animate-[sidebarSlideUp_0.5s_cubic-bezier(0.16,1,0.3,1)_both]',
      ].join(' ')}
    >
      <nav
        className={[
          'flex flex-col gap-[0.2rem] px-2',
          'max-md:flex-row max-md:gap-0 max-md:px-0 max-md:flex-1',
        ].join(' ')}
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              className={[
                'flex items-center gap-3 py-[0.7rem] px-[0.85rem]',
                'bg-none border-none border-l-3 border-l-transparent',
                'rounded-r-lg',
                'text-[var(--sidebar-text,rgba(255,255,255,0.75))]',
                'text-[0.85rem] font-medium font-[inherit] cursor-pointer',
                'transition-all duration-150 ease-in-out',
                'w-full text-left relative',
                // Hover (non-disabled)
                'hover:not-disabled:text-[var(--sidebar-text-active,#fff)]',
                'hover:not-disabled:bg-white/[0.06]',
                // Active state
                isActive && [
                  'text-[var(--sidebar-text-active,#fff)]! font-semibold',
                  'border-l-[var(--accent,#D4BC84)]',
                  'bg-[rgba(181,152,90,0.12)]',
                ].join(' '),
                // Disabled state
                item.disabled && 'opacity-35 cursor-not-allowed',
                // Mobile overrides
                'max-md:flex-col max-md:flex-1 max-md:gap-[0.2rem]',
                'max-md:py-[0.55rem] max-md:px-[0.4rem]',
                'max-md:border-l-0 max-md:rounded-none',
                'max-md:border-t-3 max-md:border-t-transparent',
                'max-md:text-center max-md:justify-center max-md:text-[0.65rem]',
                // Mobile active
                isActive && [
                  'max-md:border-l-transparent max-md:border-t-[var(--accent,#D4BC84)]',
                  'max-md:bg-[rgba(181,152,90,0.1)]',
                ].join(' '),
              ].filter(Boolean).join(' ')}
              onClick={() => !item.disabled && onNavigate(item.id)}
              disabled={item.disabled}
              title={item.disabled ? 'Coming soon' : item.label}
            >
              <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:stroke-current">
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'history' && savedCount > 0 && (
                <span className="bg-[var(--accent,#D4BC84)] text-[#00244D] text-[0.65rem] font-bold py-[0.1rem] px-[0.4rem] rounded-[10px] min-w-[1.1rem] text-center leading-[1.3]">
                  {savedCount}
                </span>
              )}
              {item.disabled && (
                <span className="text-[0.6rem] uppercase tracking-[0.04em] bg-white/[0.08] py-[0.12rem] px-[0.35rem] rounded-[4px] text-white/35 max-md:hidden">
                  Soon
                </span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="mt-auto pt-4 px-3 max-md:hidden">
        <button
          className={[
            'w-full py-[0.6rem] px-4 bg-transparent',
            'border border-[rgba(181,152,90,0.25)] rounded-lg',
            'text-[var(--accent,#D4BC84)] text-[0.8rem] font-semibold',
            'font-[inherit] cursor-pointer transition-all duration-150 ease-in-out',
            'hover:bg-[rgba(181,152,90,0.1)] hover:border-[var(--accent,#D4BC84)]',
          ].join(' ')}
          onClick={onNewAnalysis}
        >
          + New Analysis
        </button>
      </div>
    </aside>
  )
}
