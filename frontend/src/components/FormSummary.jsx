export default function FormSummary({ tickers, investment, years, onExpand }) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg cursor-pointer transition-colors hover:bg-[rgba(181,152,90,0.05)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2"
      onClick={onExpand}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onExpand()}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg)] border border-[var(--card-border)] px-3 py-1 rounded-md">
          {tickers.join(', ')}
        </span>
        <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg)] border border-[var(--card-border)] px-3 py-1 rounded-md">
          ${Number(investment).toLocaleString()}
        </span>
        <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] shrink-0" aria-hidden="true" />
        <span className="text-sm font-semibold text-[var(--text-primary)] bg-[var(--bg)] border border-[var(--card-border)] px-3 py-1 rounded-md">
          {years} years
        </span>
      </div>
      <button
        className="text-sm font-semibold text-navy bg-[var(--accent)] border-none rounded-lg px-4 py-2 cursor-pointer whitespace-nowrap shrink-0 transition-all hover:bg-[var(--accent-light)] hover:-translate-y-px"
        onClick={(e) => { e.stopPropagation(); onExpand() }}
      >
        Modify
      </button>
    </div>
  )
}
