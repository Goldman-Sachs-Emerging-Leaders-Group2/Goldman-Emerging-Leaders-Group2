import {
  formatCurrency,
  formatDecimal,
  formatPercent,
} from '../utils/formatters'
import ComparisonTable from './ComparisonTable'

const SingleResult = ({ result }) => (
  <div className="result-content" aria-live="polite">
    <p className="result-fund-name">{result.fundName || 'Unknown Fund'}</p>

    <div className="result-hero-card">
      <span className="result-hero-label">Future Value</span>
      <div className="result-hero-value">{formatCurrency(result.futureValue)}</div>
      <p className="result-hero-context">
        {formatCurrency(result.initialInvestment)} invested over {result.years ?? '—'} years
      </p>
    </div>

    <div className="result-breakdown">
      <div className="breakdown-row">
        <div className="breakdown-label-group">
          <div className="breakdown-dot blue" />
          <span className="breakdown-label">CAPM Return</span>
        </div>
        <span className="breakdown-value">{formatPercent(result.capmReturn)}</span>
      </div>

      <div className="breakdown-row">
        <div className="breakdown-label-group">
          <div className="breakdown-dot green" />
          <span className="breakdown-label">Expected Market Return</span>
        </div>
        <span className="breakdown-value">{formatPercent(result.expectedMarketReturn)}</span>
      </div>

      <div className="breakdown-row">
        <div className="breakdown-label-group">
          <div className="breakdown-dot amber" />
          <span className="breakdown-label">Risk-Free Rate</span>
        </div>
        <span className="breakdown-value">{formatPercent(result.riskFreeRate)}</span>
      </div>

      <div className="breakdown-row">
        <div className="breakdown-label-group">
          <div className="breakdown-dot purple" />
          <span className="breakdown-label">Beta</span>
        </div>
        <span className="breakdown-value">{formatDecimal(result.beta, 2)}</span>
      </div>
    </div>
  </div>
)

const ResultPanel = ({ results, isCalculating }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const isMulti = tickers.length > 1

  if (!hasResults) {
    return (
      <div className="empty-state">
        <p>
          {isCalculating
            ? 'Calculating projected outcomes…'
            : 'Run a calculation to view projected outcomes and CAPM metrics.'}
        </p>
      </div>
    )
  }

  return (
    <div className={isCalculating ? 'result-content updating' : 'result-content'} aria-live="polite">
      {isMulti ? (
        <ComparisonTable results={results} />
      ) : (
        <SingleResult result={results[tickers[0]]} />
      )}
    </div>
  )
}

export default ResultPanel
