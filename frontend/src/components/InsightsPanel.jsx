import { generateInsights, generateComparisonInsights } from '../utils/insights'

const InsightsPanel = ({ results, isCalculating }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0

  if (!hasResults) {
    return (
      <div className="empty-state">
        <p>
          {isCalculating
            ? 'Generating insights…'
            : 'Run a calculation to see insights.'}
        </p>
      </div>
    )
  }

  const { summary, insights } = tickers.length > 1
    ? generateComparisonInsights(results)
    : generateInsights(results[tickers[0]])

  return (
    <div className={`insights-content${isCalculating ? ' updating' : ''}`} aria-live="polite">
      <p className="insight-summary">{summary}</p>

      {insights.map((insight, index) => (
        <div className="insight-row" key={index}>
          <div className={`insight-indicator ${insight.type}`} />
          <div className="insight-content">
            <span className="insight-label">{insight.label}</span>
            <p className="insight-text">{insight.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default InsightsPanel
