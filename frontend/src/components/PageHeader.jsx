const BrandMark = () => (
  <span
    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] shadow-[var(--shadow-soft)]"
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[color:var(--navy)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 4.5v3.2" />
      <path d="M12 16.3v3.2" />
      <path d="m16.7 7.3-2.2 2.2" />
      <path d="m9.5 14.5-2.2 2.2" />
      <path d="M19.5 12h-3.2" />
      <path d="M7.7 12H4.5" />
      <path d="m16.7 16.7-5.1-5.1" />
      <path d="m11.6 11.6 1.9-6.1" />
    </svg>
  </span>
)

const ThemeIcon = ({ theme }) => (
  theme === 'light' ? (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="m5.64 5.64 1.77 1.77" />
      <path d="m16.59 16.59 1.77 1.77" />
      <path d="M3 12h2.5" />
      <path d="M18.5 12H21" />
      <path d="m5.64 18.36 1.77-1.77" />
      <path d="m16.59 7.41 1.77-1.77" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 15.5A7.5 7.5 0 1 1 12.5 4a6.2 6.2 0 0 0 7.5 11.5Z" />
    </svg>
  )
)

export default function PageHeader({ theme, onToggleTheme, onLogoClick }) {
  return (
    <header className="relative z-30 border-b border-[color:var(--line)] bg-[color:var(--surface-elevated)]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="group flex items-center gap-3 border-none bg-transparent p-0 text-left"
          onClick={onLogoClick}
        >
          <BrandMark />
          <div className="min-w-0">
            <span className="block text-[1rem] font-semibold leading-tight text-[color:var(--text-primary)]">
              Northline
            </span>
            <span className="block text-[0.82rem] font-medium leading-tight text-[color:var(--text-secondary)]">
              Plan with clarity.
            </span>
          </div>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2 text-xs text-[color:var(--text-secondary)] lg:flex">
            <span className="h-2 w-2 rounded-full bg-[color:var(--signal)]" aria-hidden="true" />
            Methodology is shown in plain language.
          </div>
          <button
            type="button"
            className="northline-button-secondary min-w-[9.5rem] px-3 text-sm"
            onClick={onToggleTheme}
            aria-label="Toggle color theme"
          >
            <ThemeIcon theme={theme} />
            <span>{theme === 'light' ? 'Dusk mode' : 'Day mode'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
