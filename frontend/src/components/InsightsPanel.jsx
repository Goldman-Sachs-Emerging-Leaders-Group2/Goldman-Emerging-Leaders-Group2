import { generateInsights, generateComparisonInsights } from '../utils/insights'

const INDICATOR_COLORS = {
  positive: 'var(--success)',
  neutral: 'var(--signal)',
  caution: 'var(--warning)',
}

const InsightsPanel = ({ results, isCalculating, riskTolerance }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0

  if (!hasResults) {
    return (
      <div className="northline-empty-state">
        {isCalculating ? 'Gathering guidance…' : 'Build a comparison to unlock tailored guidance and plain-language observations.'}
      </div>
    )
  }

  const { summary, insights } = tickers.length > 1
    ? generateComparisonInsights(results, riskTolerance)
    : generateInsights(results[tickers[0]], riskTolerance)

  return (
    <div
      data-testid="insights-content"
      className={`flex flex-col transition-opacity duration-200 ${isCalculating ? 'opacity-50' : ''}`}
      aria-live="polite"
    >
      <p className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-4 text-sm leading-7 text-[color:var(--text-secondary)]">
        {summary}
      </p>

      <div className="mt-4 grid gap-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: INDICATOR_COLORS[insight.type] || INDICATOR_COLORS.neutral }}
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  {insight.label}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">
                  {insight.text}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default InsightsPanel
