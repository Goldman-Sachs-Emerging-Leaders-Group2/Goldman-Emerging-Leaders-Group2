import { useState } from 'react'
import GrowthChart from './GrowthChart'
import InsightsPanel from './InsightsPanel'
import PieBreakdown from './PieBreakdown'
import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const CAPM_METRICS = [
  { key: 'beta', label: 'Beta (β)', max: 2, format: (v) => formatDecimal(v, 2), color: 'var(--signal)' },
  { key: 'capmReturn', label: 'CAPM Return', max: 0.30, format: formatPercent, color: 'var(--accent)' },
  { key: 'expectedMarketReturn', label: 'Market Return', max: 0.30, format: formatPercent, color: 'var(--navy)' },
  { key: 'riskFreeRate', label: 'Risk-Free Rate', max: 0.10, format: formatPercent, color: 'var(--text-muted)' },
  { key: 'futureValue', label: 'Future Value', format: formatCurrency, highlight: true },
]

function PerformanceArrow({ value, threshold = 0 }) {
  const isUp = value > threshold
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${isUp ? 'text-[color:var(--success)]' : 'text-[color:var(--error)]'}`}>
      <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        {isUp
          ? <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          : <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
        }
      </svg>
      {isUp ? '+' : ''}{formatPercent(value)}
    </span>
  )
}

export default function AnalyticsView({ results, isCalculating, isMulti, bestResult, goalAmount, riskTolerance, onNavigate }) {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const [selectedTicker, setSelectedTicker] = useState(null)

  const activeTicker = selectedTicker && tickers.includes(selectedTicker) ? selectedTicker : null
  const selectedResult = activeTicker ? results[activeTicker] : null

  const handleTickerClick = (t) => {
    setSelectedTicker((prev) => (prev === t ? null : t))
  }

  if (!hasResults && !isCalculating) {
    return (
      <section className="py-10">
        <div className="northline-empty-state">
          Build a comparison to unlock analytics and projections.
          <div className="mt-4">
            <button type="button" className="northline-button-primary" onClick={() => onNavigate('plan')}>
              Go to planner
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-8 py-10">
      {/* Header */}
      <div className="max-w-[62ch]">
        <p className="northline-eyebrow mb-3">Analytics</p>
        <h1 className="northline-page-title">Dig into the signals behind each fund.</h1>
        <p className="mt-4 text-base leading-8 text-[color:var(--text-secondary)]">
          Growth projections, CAPM indicators, and plain-language insights for the funds in your comparison.
        </p>
      </div>

      {/* Fund selector + return badge */}
      <div className="northline-card flex flex-wrap items-center justify-between gap-4 rounded-[28px] px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {isMulti ? (
            <div className="flex flex-wrap gap-1.5">
              {tickers.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={[
                    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition',
                    t === activeTicker
                      ? 'bg-[color:var(--navy)] text-white'
                      : 'border border-[color:var(--line)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]',
                  ].join(' ')}
                  onClick={() => handleTickerClick(t)}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getFundColor(i) }} />
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              className={[
                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition',
                activeTicker
                  ? 'bg-[color:var(--navy)] text-white'
                  : 'border border-[color:var(--line)] text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)]',
              ].join(' ')}
              onClick={() => handleTickerClick(tickers[0])}
            >
              {tickers[0]}
            </button>
          )}
          {selectedResult && (
            <span className="text-sm text-[color:var(--text-secondary)]">{selectedResult.fundName}</span>
          )}
          {!selectedResult && (
            <span className="text-sm text-[color:var(--text-muted)]">Select a fund for detailed indicators</span>
          )}
        </div>
        {selectedResult && <PerformanceArrow value={selectedResult.capmReturn} />}
      </div>

      {/* Growth Chart */}
      <div className="northline-card rounded-[28px] p-5 sm:p-6">
        <p className="northline-eyebrow mb-2">Growth path</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
          Projected growth over time
        </h2>
        <div className="mt-5">
          <GrowthChart results={results} isCalculating={isCalculating} goalAmount={goalAmount} />
        </div>
      </div>

      {/* CAPM Indicators + Pie Breakdown */}
      {selectedResult && (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="northline-card rounded-[28px] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="northline-eyebrow">CAPM indicators</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--signal)]/20 bg-[color:var(--signal)]/6 px-2.5 py-1 text-[0.68rem] font-semibold text-[color:var(--signal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--signal)] animate-pulse" />
                Live
              </span>
            </div>
            <div className="mt-5 grid gap-4">
              {CAPM_METRICS.map(({ key, label, max, format, color, highlight }) => {
                const value = selectedResult[key]
                return (
                  <div key={`${key}-${label}`} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-sm text-[color:var(--text-secondary)]">{label}</span>
                    {max != null && (
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[color:var(--surface-muted)]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min((value / max) * 100, 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    )}
                    <span className={[
                      'shrink-0 text-right tabular-nums text-sm font-semibold',
                      highlight ? 'text-[color:var(--signal)]' : 'text-[color:var(--text-primary)]',
                    ].join(' ')}>
                      {format(value)}
                    </span>
                    {key === 'capmReturn' && (
                      <PerformanceArrow value={value} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="northline-card rounded-[28px] p-5 sm:p-6">
            <p className="northline-eyebrow mb-2">Breakdown</p>
            <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
              What is driving the total
            </h2>
            <div className="mt-5">
              <PieBreakdown result={selectedResult} isMulti={false} />
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="northline-card rounded-[28px] p-5 sm:p-6">
        <p className="northline-eyebrow mb-2">Guidance</p>
        <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
          Planning insights
        </h2>
        <div className="mt-5">
          <InsightsPanel results={results} isCalculating={isCalculating} riskTolerance={riskTolerance} />
        </div>
      </div>
    </section>
  )
}
