import { useAppContext } from '../context/AppContext'
import { formatPercent } from '../utils/formatters'

const SettingsView = () => {
  const { assets, riskFreeRate } = useAppContext()

  const mutualFunds = assets.filter((a) => a.type === 'MUTUAL_FUND')
  const etfs = assets.filter((a) => a.type === 'ETF')

  return (
    <main className="main-content">
      <div className="panel">
        <div className="panel-header">
          <h2>Application Settings</h2>
        </div>

        <div className="settings-grid">
          <div className="settings-section">
            <h3 className="settings-section-title">CAPM Parameters</h3>
            <div className="settings-row">
              <span className="settings-label">Risk-Free Rate</span>
              <span className="settings-value">{riskFreeRate != null ? formatPercent(riskFreeRate) : '4.25% (default)'}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Benchmark Index</span>
              <span className="settings-value">S&P 500 (^GSPC)</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Beta Source</span>
              <span className="settings-value">Newton Analytics API</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Historical Data Source</span>
              <span className="settings-value">Yahoo Finance API</span>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Available Assets</h3>
            <div className="settings-row">
              <span className="settings-label">Total Assets</span>
              <span className="settings-value">{assets.length}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Mutual Funds</span>
              <span className="settings-value">{mutualFunds.length}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">ETFs</span>
              <span className="settings-value">{etfs.length}</span>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">About</h3>
            <div className="settings-row">
              <span className="settings-label">Application</span>
              <span className="settings-value">CapmFlow v1.0</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Calculation Model</span>
              <span className="settings-value">Capital Asset Pricing Model (CAPM)</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Future Value Formula</span>
              <span className="settings-value">P × e^(r × t)</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SettingsView
