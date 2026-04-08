import { useEffect, useRef, useState } from 'react'
import { formatPercent } from '../utils/formatters'

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

export default function PageHeader({ theme, onToggleTheme, onLogoClick, funds = [], selectedTickers = [], onSelectFund }) {
  const [query, setQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef(null)

  const filtered = query.trim()
    ? funds.filter((f) => {
        const q = query.toLowerCase()
        return f.ticker.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)
      })
    : []

  const handleSelect = (ticker) => {
    if (onSelectFund) onSelectFund(ticker)
    setQuery('')
    setShowDropdown(false)
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
          {/* Fund Search */}
          <div className="relative" ref={searchRef}>
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-3 py-2">
              <svg className="h-3.5 w-3.5 shrink-0 text-[color:var(--text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className="w-36 border-none bg-transparent text-xs text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] lg:w-48"
                placeholder="Search funds…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowDropdown(true) }}
                onFocus={() => { if (query.trim()) setShowDropdown(true) }}
                onKeyDown={(e) => { if (e.key === 'Escape') { setShowDropdown(false); e.target.blur() } }}
              />
            </div>

            {showDropdown && query.trim() && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-strong)] shadow-[var(--shadow)]">
                {filtered.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[color:var(--text-muted)]">No funds found</div>
                ) : (
                  filtered.map((fund) => {
                    const isSelected = selectedTickers.includes(fund.ticker)
                    return (
                      <button
                        key={fund.ticker}
                        type="button"
                        className={[
                          'flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-[color:var(--surface-muted)]',
                          isSelected ? 'opacity-50' : '',
                        ].join(' ')}
                        onClick={() => handleSelect(fund.ticker)}
                      >
                        <span className="text-sm font-semibold text-[color:var(--text-primary)]">{fund.ticker}</span>
                        <span className="flex-1 truncate text-xs text-[color:var(--text-secondary)]">{fund.name}</span>
                        <span className="shrink-0 text-xs tabular-nums text-[color:var(--signal)]">{formatPercent(fund.expectedAnnualReturn)}</span>
                        {isSelected && (
                          <span className="shrink-0 text-[0.65rem] text-[color:var(--text-muted)]">added</span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            )}
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
