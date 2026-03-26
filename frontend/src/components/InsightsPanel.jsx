import { generateInsights, generateComparisonInsights } from '../utils/insights'

const INDICATOR_COLORS = {
  positive: 'var(--success)',
  neutral: '#2E6B9E',
  caution: '#B5985A',
}

const InsightsPanel = ({ results, isCalculating, riskTolerance }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0

  if (!hasResults) {
    return (
      <div
        className="rounded-lg p-8 text-center text-sm"
        style={{
          border: '1px dashed var(--card-border)',
          color: 'var(--text-muted)',
        }}
      >
        <p>
          {isCalculating
            ? 'Generating insights…'
            : 'Run a calculation to see insights.'}
        </p>
      </div>
    )
  }

  const { summary, insights } = tickers.length > 1
    ? generateComparisonInsights(results, riskTolerance)
    : generateInsights(results[tickers[0]], riskTolerance)

  return (
    <div
      data-testid="insights-content"
      className={`flex flex-col transition-opacity duration-200${isCalculating ? ' opacity-50' : ''}`}
      aria-live="polite"
    >
      <p
        className="mb-3 text-sm italic leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {summary}
      </p>

      {insights.map((insight, index) => (
        <div
          className="flex items-start gap-2.5 py-2.5 px-2 -mx-2 rounded-lg transition-colors duration-150 hover:bg-[rgba(181,152,90,0.04)]"
          style={{
            borderTop: index > 0 ? '1px solid var(--card-border)' : 'none',
            animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
            animationDelay: `${1.5 + index * 0.1}s`,
          }}
          key={index}
        >
          <div
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ background: INDICATOR_COLORS[insight.type] || INDICATOR_COLORS.neutral }}
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: 'var(--text-primary)' }}
            >
              {insight.label}
            </span>
            <p
              className="mt-0.5 text-sm"
              style={{ color: 'var(--text-secondary)', margin: '0.15rem 0 0' }}
            >
              {insight.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default InsightsPanel
