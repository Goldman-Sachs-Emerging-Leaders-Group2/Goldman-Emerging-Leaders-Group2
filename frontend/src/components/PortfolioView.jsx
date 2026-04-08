import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

export default function PortfolioView({ results, bestResult, primaryResult, hasResults, resultCount, onNavigate }) {
  const tickers = Object.keys(results)

  if (!hasResults) {
    return (
      <section className="py-10">
        <div className="northline-empty-state">
          Build a comparison to see your portfolio overview.
          <div className="mt-4">
            <button type="button" className="northline-button-primary" onClick={() => onNavigate('plan')}>
              Go to planner
            </button>
          </div>
        </div>
      </section>
    )
  }

  const totalFV = tickers.reduce((sum, t) => sum + results[t].futureValue, 0)
  const totalContributed = tickers.reduce((sum, t) => sum + (results[t].totalContributed || results[t].initialInvestment), 0)
  const totalReturnPct = totalContributed > 0 ? (totalFV - totalContributed) / totalContributed : 0
  const allocations = tickers.map((t, i) => ({
    ticker: t,
    pct: totalFV > 0 ? results[t].futureValue / totalFV : 0,
    color: getFundColor(i),
  }))

  const bestBeta = tickers.reduce((b, t) => results[t].beta < results[b].beta ? t : b, tickers[0])
  const bestCapm = tickers.reduce((b, t) => results[t].capmReturn > results[b].capmReturn ? t : b, tickers[0])
  const bestMarket = tickers.reduce((b, t) => results[t].expectedMarketReturn > results[b].expectedMarketReturn ? t : b, tickers[0])
  const bestFV = tickers.reduce((b, t) => results[t].futureValue > results[b].futureValue ? t : b, tickers[0])

  return (
    <section className="grid gap-8 py-10">
      <div className="max-w-[62ch]">
        <p className="northline-eyebrow mb-3">Portfolio</p>
        <h1 className="northline-page-title">Your portfolio at a glance.</h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
          Aggregate performance, allocation breakdown, and the standout fund across your current comparison.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Total Portfolio Value */}
        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-3">Total portfolio value</p>
          <div className="flex items-baseline gap-3">
            <span className="text-[2rem] font-semibold tracking-[-0.04em] text-[color:var(--text-primary)]">
              {formatCurrency(totalFV)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[color:var(--signal)]/20 bg-[color:var(--signal)]/8 px-2.5 py-1 text-xs font-semibold text-[color:var(--signal)]">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +{(totalReturnPct * 100).toFixed(2)}%
            </span>
          </div>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            {tickers.length} fund{tickers.length !== 1 ? 's' : ''} · {formatCurrency(totalContributed)} contributed · {primaryResult?.years ?? '—'} yr horizon
          </p>
        </div>

        {/* Allocation */}
        <div className="northline-card rounded-[28px] p-5 sm:p-6">
          <p className="northline-eyebrow mb-3">Allocation</p>
          <div className="mt-1 flex h-3 overflow-hidden rounded-full">
            {allocations.map(({ ticker, pct, color }) => (
              <div
                key={ticker}
                className="transition-all duration-500"
                style={{ width: `${(pct * 100).toFixed(1)}%`, backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-4 grid gap-2">
            {allocations.map(({ ticker, pct, color }) => (
              <div key={ticker} className="flex items-center gap-2 text-sm">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[color:var(--text-primary)]">{ticker}</span>
                <span className="ml-auto font-semibold tabular-nums text-[color:var(--text-secondary)]">{(pct * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Performer */}
        <div className="northline-card-strong rounded-[28px] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[color:var(--hero-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">Best Performer</span>
          </div>
          <p className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hero-text)]">{bestFV}</p>
          <p className="mt-1 text-sm text-[color:var(--hero-muted)]">{bestResult?.fundName}</p>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-lg font-semibold text-[color:var(--hero-text)]">{formatCurrency(bestResult?.futureValue)}</span>
            <span className="text-sm text-[color:var(--hero-muted)]">{formatPercent(bestResult?.capmReturn)} CAPM</span>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="northline-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="northline-eyebrow">Comparison breakdown</p>
            <span className="rounded-full bg-[color:var(--navy)] px-2 py-0.5 text-[0.72rem] font-semibold text-white">
              {tickers.length}
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)]">
                <th className="pb-3 pr-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]" />
                <th className="pb-3 pr-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Ticker</th>
                <th className="pb-3 pr-4 text-left text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Name</th>
                <th className="pb-3 pr-4 text-right text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Beta</th>
                <th className="pb-3 pr-4 text-right text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">CAPM Return</th>
                <th className="pb-3 pr-4 text-right text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Market Return</th>
                <th className="pb-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Future Value</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker, i) => {
                const r = results[ticker]
                const isBest = ticker === bestFV
                return (
                  <tr
                    key={ticker}
                    className={[
                      'border-b border-[color:var(--line)]/50 transition',
                      isBest ? 'bg-[color:var(--signal)]/6' : '',
                    ].join(' ')}
                  >
                    <td className="py-3 pr-4">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getFundColor(i) }} />
                    </td>
                    <td className="py-3 pr-4 font-semibold text-[color:var(--text-primary)]">{ticker}</td>
                    <td className="py-3 pr-4 text-[color:var(--text-secondary)]">{r.fundName}</td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${ticker === bestBeta && tickers.length > 1 ? 'font-semibold text-[color:var(--signal)]' : 'text-[color:var(--text-secondary)]'}`}>
                      {formatDecimal(r.beta, 2)}
                    </td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${ticker === bestCapm && tickers.length > 1 ? 'font-semibold text-[color:var(--signal)]' : 'text-[color:var(--text-secondary)]'}`}>
                      {formatPercent(r.capmReturn)}
                    </td>
                    <td className={`py-3 pr-4 text-right tabular-nums ${ticker === bestMarket && tickers.length > 1 ? 'font-semibold text-[color:var(--signal)]' : 'text-[color:var(--text-secondary)]'}`}>
                      {formatPercent(r.expectedMarketReturn)}
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold text-[color:var(--text-primary)]">
                      {formatCurrency(r.futureValue)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
