import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getAssetColor } from '../utils/colors'

const TYPE_DISPLAY = {
  MUTUAL_FUND: 'Mutual Fund',
  ETF: 'ETF',
}

const PortfolioView = () => {
  const { results, hasResults, bestResult, primaryResult, clearResults } = useAppContext()
  const tickers = Object.keys(results)

  if (!hasResults) {
    return (
      <main className="main-content">
        <div className="panel dashboard-cta">
          <h3>No Calculations Yet</h3>
          <p>Run a calculation to build your portfolio view.</p>
          <Link to="/calculator" className="cta-button">Go to Calculator</Link>
        </div>
      </main>
    )
  }

  // Compute portfolio aggregates
  const totalFV = tickers.reduce((sum, t) => sum + results[t].futureValue, 0)
  const totalInvested = tickers.reduce((sum, t) => sum + results[t].initialInvestment, 0)
  const totalReturnPct = totalInvested > 0 ? (totalFV - totalInvested) / totalInvested : 0
  const allocations = tickers.map((t, i) => ({
    ticker: t,
    pct: totalFV > 0 ? results[t].futureValue / totalFV : 0,
    color: getAssetColor(i),
  }))

  // Best metric per column
  const bestBetaTicker = tickers.reduce((best, t) => results[t].beta < results[best].beta ? t : best, tickers[0])
  const bestCapmTicker = tickers.reduce((best, t) => results[t].capmReturn > results[best].capmReturn ? t : best, tickers[0])
  const bestMarketTicker = tickers.reduce((best, t) => results[t].expectedMarketReturn > results[best].expectedMarketReturn ? t : best, tickers[0])
  const bestFVTicker = tickers.reduce((best, t) => results[t].futureValue > results[best].futureValue ? t : best, tickers[0])

  return (
    <main className="main-content">
      {/* Summary Cards */}
      <div className="portfolio-summary-row">
        {/* Card 1: Total Portfolio Value */}
        <div className="portfolio-summary-card">
          <span className="portfolio-summary-label">Total Portfolio Value</span>
          <div className="portfolio-total-row">
            <span className="portfolio-total-value">{formatCurrency(totalFV)}</span>
            <span className="portfolio-return-badge">
              <svg viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +{(totalReturnPct * 100).toFixed(2)}%
            </span>
          </div>
          <p className="portfolio-summary-sub">
            {tickers.length} asset{tickers.length !== 1 ? 's' : ''} &middot; {formatCurrency(totalInvested)} invested &middot; {primaryResult?.years ?? '—'} yr horizon
          </p>
        </div>

        {/* Card 2: Allocation */}
        <div className="portfolio-summary-card">
          <span className="portfolio-summary-label">Allocation</span>
          <div className="allocation-bar">
            {allocations.map(({ ticker, pct, color }) => (
              <div
                key={ticker}
                className="allocation-bar-segment"
                style={{ width: `${(pct * 100).toFixed(1)}%`, backgroundColor: color }}
              />
            ))}
          </div>
          <div className="allocation-legend">
            {allocations.map(({ ticker, pct, color }) => (
              <div key={ticker} className="allocation-legend-item">
                <span className="allocation-legend-dot" style={{ backgroundColor: color }} />
                <span>{ticker}</span>
                <span className="allocation-legend-pct">{(pct * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Best Performer */}
        <div className="portfolio-summary-card portfolio-best-card">
          <div className="portfolio-best-label-row">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span>Best Performer</span>
          </div>
          <div className="portfolio-best-ticker">{bestFVTicker}</div>
          <p className="portfolio-best-name">{bestResult.assetName}</p>
          <div className="portfolio-best-value-row">
            <span className="portfolio-best-fv">{formatCurrency(bestResult.futureValue)}</span>
            <span className="portfolio-best-capm">{formatPercent(bestResult.capmReturn)} CAPM</span>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="panel">
        <div className="panel-header">
          <h2 className="portfolio-table-title">
            Calculated Assets
            <span className="portfolio-count-badge">{tickers.length}</span>
          </h2>
          <button className="clear-button" onClick={clearResults}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.3rem' }}>
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Clear All
          </button>
        </div>

        <div className="portfolio-table-wrapper">
          <table className="portfolio-table">
            <thead>
              <tr>
                <th></th>
                <th>Ticker</th>
                <th>Name</th>
                <th>Type</th>
                <th>Beta</th>
                <th>CAPM Return</th>
                <th>Market Return</th>
                <th style={{ textAlign: 'right' }}>Future Value</th>
              </tr>
            </thead>
            <tbody>
              {tickers.map((ticker, i) => {
                const r = results[ticker]
                const isBest = ticker === bestFVTicker
                return (
                  <tr key={ticker} className={isBest ? 'portfolio-row-best' : ''}>
                    <td>
                      <span className="portfolio-color-dot" style={{ backgroundColor: getAssetColor(i) }} />
                    </td>
                    <td className="portfolio-ticker">{ticker}</td>
                    <td className="portfolio-name">{r.assetName}</td>
                    <td className="portfolio-type">{TYPE_DISPLAY[r.assetType] || r.assetType}</td>
                    <td className={`portfolio-num${ticker === bestBetaTicker && tickers.length > 1 ? ' portfolio-highlight-green' : ''}`}>
                      {formatDecimal(r.beta, 2)}
                    </td>
                    <td className={`portfolio-num${ticker === bestCapmTicker && tickers.length > 1 ? ' portfolio-highlight-green' : ''}`}>
                      {formatPercent(r.capmReturn)}
                    </td>
                    <td className={`portfolio-num${ticker === bestMarketTicker && tickers.length > 1 ? ' portfolio-highlight-green' : ''}`}>
                      {formatPercent(r.expectedMarketReturn)}
                    </td>
                    <td className="portfolio-value">{formatCurrency(r.futureValue)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default PortfolioView
