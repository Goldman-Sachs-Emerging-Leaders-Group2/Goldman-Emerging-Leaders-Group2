import {
  formatCurrency,
  formatDecimal,
  formatPercent,
} from '../utils/formatters'
import ComparisonTable from './ComparisonTable'

const SingleResult = ({ result }) => (
  <div className="result-content" aria-live="polite">
    <p className="result-fund-name">{result.assetName || 'Unknown Asset'}</p>

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

const BestPerformerBar = ({ results }) => {
  const tickers = Object.keys(results)
  if (tickers.length < 2) return null

  const sorted = [...tickers].sort((a, b) => results[b].futureValue - results[a].futureValue)
  const bestTicker = sorted[0]
  const secondTicker = sorted[1]
  const best = results[bestTicker]
  const second = results[secondTicker]
  const advantage = best.futureValue - second.futureValue
  const advantagePct = second.futureValue > 0 ? advantage / second.futureValue : 0

  return (
    <div className="best-performer-bar">
      <svg className="trophy-icon" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
        <path d="M4 22h16" />
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
      </svg>
      <div className="best-performer-info">
        <span className="best-performer-label">Best Performer</span>
        <span className="best-performer-value">{bestTicker} — {best.assetName}</span>
      </div>
      <div className="best-performer-advantage">
        <span className="best-performer-label">Advantage</span>
        <span className="best-performer-diff">
          <svg viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          </svg>
          +{formatCurrency(advantage)} (+{formatPercent(advantagePct)})
        </span>
      </div>
    </div>
  )
}

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
        <>
          <ComparisonTable results={results} />
          <BestPerformerBar results={results} />
        </>
      ) : (
        <SingleResult result={results[tickers[0]]} />
      )}
    </div>
  )
}

export default ResultPanel
