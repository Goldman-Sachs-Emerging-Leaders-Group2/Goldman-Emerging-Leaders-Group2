import { useState } from 'react'
import { Link } from 'react-router-dom'
import GrowthChart from '../components/GrowthChart'
import InsightsPanel from '../components/InsightsPanel'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'

const TIME_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y']

const CAPM_METRICS = [
  { key: 'beta', label: 'Beta (β)', max: 2, format: (v) => formatDecimal(v, 2), color: '#16A34A' },
  { key: 'capmReturn', label: 'CAPM Return', max: 0.30, format: formatPercent, color: '#D4A846' },
  { key: 'expectedMarketReturn', label: 'Market Return', max: 0.30, format: formatPercent, color: '#3B82F6' },
  { key: 'riskFreeRate', label: 'Risk-Free Rate', max: 0.10, format: formatPercent, color: '#EF4444' },
  { key: 'capmReturn', label: 'Expected Return', max: 0.30, format: formatPercent, color: '#EF4444', aliasKey: 'expectedReturn' },
  { key: 'futureValue', label: 'Future Value', format: formatCurrency, highlight: true },
]

const AnalyticsView = () => {
  const { results, isCalculating, isStale, hasResults, isMulti } = useAppContext()
  const tickers = Object.keys(results)

  const [selectedTicker, setSelectedTicker] = useState(() => tickers[0] || '')
  const [activeRange, setActiveRange] = useState('1Y')

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
            {TIME_RANGES.map((range) => (
              <button
                key={range}
                className={`time-range-tab${range === activeRange ? ' active' : ''}`}
                onClick={() => setActiveRange(range)}
              >
                {range}
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
        <GrowthChart results={results} isCalculating={isCalculating} />
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
                    <span className="capm-indicator-label">{label}</span>
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
