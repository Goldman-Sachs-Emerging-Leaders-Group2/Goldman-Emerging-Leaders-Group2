import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatPercent, formatDecimal } from '../utils/formatters'

const HistoryView = () => {
  const { history, clearHistory } = useAppContext()
  const [expandedId, setExpandedId] = useState(null)

  if (history.length === 0) {
    return (
      <main className="main-content">
        <div className="panel dashboard-cta">
          <h3>No Calculation History</h3>
          <p>Run a calculation to start building your history.</p>
          <Link to="/calculator" className="cta-button">Go to Calculator</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="main-content">
      <div className="panel">
        <div className="panel-header">
          <h2>Calculation History <span className="portfolio-count-badge">{history.length}</span></h2>
          <button className="clear-button" onClick={clearHistory}>Clear All</button>
        </div>
        <div className="history-list">
          {history.map((entry) => {
            const isExpanded = expandedId === entry.id
            const tickers = Object.keys(entry.results)
            const totalFV = tickers.reduce((sum, t) => sum + entry.results[t].futureValue, 0)
            return (
              <div key={entry.id} className="history-entry">
                <button
                  className="history-entry-header"
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                >
                  <span className="history-timestamp">
                    {new Date(entry.timestamp).toLocaleString()}
                  </span>
                  <span className="history-tickers">{tickers.join(', ')}</span>
                  <span className="history-summary">
                    {formatCurrency(entry.form.investment)} &times; {entry.form.years}yr &rarr; {formatCurrency(totalFV)}
                  </span>
                  <span className="history-chevron">{isExpanded ? '−' : '+'}</span>
                </button>
                {isExpanded && (
                  <div className="history-entry-details">
                    <table className="portfolio-table">
                      <thead>
                        <tr>
                          <th>Ticker</th>
                          <th>Name</th>
                          <th>Beta</th>
                          <th>CAPM Return</th>
                          <th>Risk-Free Rate</th>
                          <th style={{ textAlign: 'right' }}>Future Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickers.map((t) => {
                          const r = entry.results[t]
                          return (
                            <tr key={t}>
                              <td className="portfolio-ticker">{t}</td>
                              <td className="portfolio-name">{r.assetName}</td>
                              <td className="portfolio-num">{formatDecimal(r.beta, 2)}</td>
                              <td className="portfolio-num">{formatPercent(r.capmReturn)}</td>
                              <td className="portfolio-num">{formatPercent(r.riskFreeRate)}</td>
                              <td className="portfolio-value">{formatCurrency(r.futureValue)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}

export default HistoryView
