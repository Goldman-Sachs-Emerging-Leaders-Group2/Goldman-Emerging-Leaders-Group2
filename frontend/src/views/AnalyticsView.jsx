import { useState } from 'react'
import { Link } from 'react-router-dom'
import GrowthChart from '../components/GrowthChart'
import InsightsPanel from '../components/InsightsPanel'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'

const TIME_RANGES = [
  { label: '1Y', years: 1 },
  { label: '3Y', years: 3 },
  { label: '5Y', years: 5 },
  { label: '10Y', years: 10 },
  { label: 'Max', years: null },
]

const CAPM_METRICS = [
  { key: 'beta', label: 'Beta (β)', max: 2, format: (v) => formatDecimal(v, 2), color: '#16A34A' },
  { key: 'capmReturn', label: 'CAPM Return', max: 0.30, format: formatPercent, color: '#D4A846' },
  { key: 'expectedMarketReturn', label: 'Market Return', max: 0.30, format: formatPercent, color: '#3B82F6' },
  { key: 'riskFreeRate', label: 'Risk-Free Rate', max: 0.10, format: formatPercent, color: '#EF4444' },
  { key: 'capmReturn', label: 'Expected Return', max: 0.30, format: formatPercent, color: '#EF4444', aliasKey: 'expectedReturn' },
  { key: 'futureValue', label: 'Future Value', format: formatCurrency, highlight: true },
]

const EXPLAIN_PROMPTS = {
  beta: 'Explain what beta means for my investment in simple terms',
  capmReturn: 'Explain what CAPM Return means and why it matters',
  expectedMarketReturn: 'Explain what Market Return means for my portfolio',
  riskFreeRate: 'Explain what the Risk-Free Rate is and how it affects my returns',
  expectedReturn: 'Explain what Expected Return means for my investment',
  futureValue: 'Explain what Future Value means and how it is calculated',
}

const AnalyticsView = ({ onExplainMetric }) => {
  const { results, isCalculating, isStale, hasResults, isMulti } = useAppContext()
  const tickers = Object.keys(results)

  const [selectedTicker, setSelectedTicker] = useState(() => tickers[0] || '')
  const [activeRange, setActiveRange] = useState('Max')

  // Keep selectedTicker in sync
  const activeTicker = tickers.includes(selectedTicker) ? selectedTicker : tickers[0]
  const selectedResult = activeTicker ? results[activeTicker] : null

  if (!hasResults && !isCalculating) {
    return (
      <main className="main-content">
        <div className="panel dashboard-cta">
          <p>Run a calculation first to see projections and insights.</p>
          <Link to="/calculator" className="cta-button">Go to Calculator</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      {/* Asset selector bar */}
      {selectedResult && (
        <div className="analytics-asset-bar">
          <div className="analytics-asset-info">
            {isMulti ? (
              <div className="analytics-ticker-tabs">
                {tickers.map((t) => (
                  <button
                    key={t}
                    className={`analytics-ticker-tab${t === activeTicker ? ' active' : ''}`}
                    onClick={() => setSelectedTicker(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            ) : (
              <span className="analytics-ticker">{activeTicker}</span>
            )}
            <span className="analytics-fund-name">{selectedResult.assetName}</span>
            <span className="analytics-return-badge">
              <svg viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +{formatPercent(selectedResult.capmReturn)}
            </span>
          </div>
          <div className="time-range-tabs">
            {TIME_RANGES.map(({ label }) => (
              <button
                key={label}
                className={`time-range-tab${label === activeRange ? ' active' : ''}`}
                onClick={() => setActiveRange(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chart */}
      <article className="panel chart-panel">
        <div className="panel-header">
          <h2 className="result-panel-title">Projected Growth</h2>
          <div className="result-header-pills">
            {isStale && <span className="stale-pill">Stale</span>}
            {hasResults && !isStale && !isCalculating && (
              <span className="live-badge"><span className="live-dot" /> LIVE</span>
            )}
          </div>
        </div>
        <GrowthChart results={results} isCalculating={isCalculating} timeRangeYears={TIME_RANGES.find((r) => r.label === activeRange)?.years ?? null} />
      </article>

      {/* Bottom two-column: Insights + CAPM Indicators */}
      <div className="analytics-bottom-grid">
        <article className="panel insights-panel">
          <div className="panel-header">
            <h2 className="result-panel-title">Insights</h2>
          </div>
          <InsightsPanel results={results} isCalculating={isCalculating} />
        </article>

        {selectedResult && (
          <article className="panel">
            <div className="panel-header">
              <h2 className="capm-indicators-title">CAPM Indicators</h2>
              <span className="live-badge"><span className="live-dot" /> Real-time</span>
            </div>
            <div className="capm-indicators-rows">
              {CAPM_METRICS.map(({ key, label, max, format, color, highlight, aliasKey }) => {
                const value = selectedResult[key]
                const displayKey = aliasKey || key
                return (
                  <div className="capm-indicator-row" key={displayKey}>
                    <span className="capm-indicator-label">
                      {label}
                      {onExplainMetric && (
                        <button
                          className="explain-this-btn"
                          onClick={() => onExplainMetric(EXPLAIN_PROMPTS[displayKey] || `Explain ${label}`)}
                          title={`Explain ${label}`}
                          aria-label={`Explain ${label}`}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
                          </svg>
                        </button>
                      )}
                    </span>
                    {max != null && (
                      <div className="capm-indicator-bar-track">
                        <div
                          className="capm-indicator-bar-fill"
                          style={{
                            width: `${Math.min((value / max) * 100, 100)}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    )}
                    <span className={`capm-indicator-value${highlight ? ' highlight' : ''}`}>
                      {format(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </article>
        )}
      </div>
    </main>
  )
}

export default AnalyticsView
