export default function PageHeader({ theme, onToggleTheme, onLogoClick }) {
  return (
    <header className="sticky top-0 z-100 bg-[#00244D] border-b-[3px] border-[#B5985A] shrink-0">
      <div className="max-w-[1200px] mx-auto px-8 max-md:px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div
          className={`flex items-center gap-3 ${onLogoClick ? 'cursor-pointer' : ''}`}
          onClick={onLogoClick}
          onKeyDown={onLogoClick ? (e) => e.key === 'Enter' && onLogoClick() : undefined}
          role={onLogoClick ? 'button' : undefined}
          tabIndex={onLogoClick ? 0 : undefined}
          title={onLogoClick ? 'Back to calculator' : undefined}
        >
          <div className="w-9 h-9 rounded-lg bg-[#B5985A] text-[#00244D] font-bold text-[0.85rem] flex items-center justify-center shrink-0">
            GS
          </div>
          <div className="flex flex-col">
            <span className="text-base max-[480px]:text-[0.85rem] font-bold text-white leading-tight">
              Goldman Sachs
            </span>
            <span className="text-[0.72rem] max-[480px]:hidden font-medium text-[#B5985A] tracking-[0.02em]">
              Emerging Leaders Program
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <button
            className="w-[34px] h-[34px] rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-[#B5985A] cursor-pointer transition-colors hover:bg-white/20"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>
          <span className="text-[0.7rem] font-semibold text-[#B5985A] border border-[#B5985A]/40 rounded-full px-2.5 py-0.5">
            Group 2
          </span>
        </div>
      </div>
    </header>
  )
}
