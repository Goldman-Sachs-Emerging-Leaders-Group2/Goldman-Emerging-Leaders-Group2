import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import StatusBanner from '../components/StatusBanner'
import { useAppContext } from '../context/AppContext'
import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'

const DashboardView = () => {
  const {
    hasResults, isMulti, bestResult, primaryResult,
    resultTickers, resultCount, isCalculating, calculationError,
    statusMessage,
  } = useAppContext()

  return (
    <main className="main-content">
      <div className="page-hero">
        <span className="hero-label">Investment Overview</span>
        <div className="hero-value-row">
          <h1 className="hero-value">
            {bestResult ? formatCurrency(bestResult.futureValue) : '$0.00'}
          </h1>
          {bestResult && (
            <span className="hero-change">
              <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              </svg>
              +{formatPercent(bestResult.capmReturn)}
            </span>
          )}
        </div>
        <p className="page-hero-sub">
          {bestResult
            ? `${formatCurrency(bestResult.initialInvestment)} invested over ${bestResult.years} years \u00B7 ${bestResult.assetName}`
            : 'Track your CAPM inputs and get projected future value recommendations.'}
        </p>
      </div>

      <div className="stat-cards-row">
        <StatCard
          label={isMulti ? 'Best Future Value' : 'Future Value'}
          indicatorColor="gold"
          value={bestResult ? formatCurrency(bestResult.futureValue) : null}
          subText={bestResult
            ? isMulti
              ? bestResult.assetName
              : `${formatCurrency(bestResult.initialInvestment)} invested over ${bestResult.years} yrs`
            : null}
          valueClassName="gold"
          className="gold-highlight"
          isLoading={isCalculating}
          hasError={!!calculationError && !hasResults}
        />
        <StatCard
          label={isMulti ? 'Best CAPM Return' : 'CAPM Return'}
          indicatorColor="blue"
          value={bestResult ? formatPercent(bestResult.capmReturn) : null}
          subText={bestResult
            ? isMulti ? bestResult.assetName : `CAPM rate for ${bestResult.assetName}`
            : null}
          isLoading={isCalculating}
          hasError={!!calculationError && !hasResults}
        />
        <StatCard
          label="Market Return"
          indicatorColor="blue"
          value={primaryResult ? formatPercent(primaryResult.expectedMarketReturn) : null}
          subText={primaryResult ? 'Expected market return (S&P 500)' : null}
          isLoading={isCalculating}
          hasError={!!calculationError && !hasResults}
        />
        <StatCard
          label={isMulti ? 'Assets Compared' : 'Beta'}
          indicatorColor="amber"
          value={hasResults
            ? isMulti
              ? String(resultCount)
              : formatDecimal(primaryResult.beta, 2)
            : null}
          subText={hasResults
            ? isMulti
              ? resultTickers.join(', ')
              : `Systematic risk for ${primaryResult.assetName}`
            : null}
          isLoading={isCalculating}
          hasError={!!calculationError && !hasResults}
        />
      </div>

      <StatusBanner type={statusMessage?.type} message={statusMessage?.message} />

      {!hasResults && !isCalculating && (
        <div className="panel dashboard-cta">
          <h3>Get Started</h3>
          <p>Select assets and run your first CAPM calculation to see projected returns.</p>
          <Link to="/calculator" className="cta-button">Go to Calculator</Link>
        </div>
      )}

      {hasResults && (
        <div className="dashboard-bottom-grid">
          <div className="panel">
            <div className="panel-header">
              <h2>Latest Calculation</h2>
              <span className="panel-badge live">LIVE</span>
            </div>
            <div className="gradient-divider" />
            <p className="latest-calc-summary">
              <strong>{bestResult.assetName}</strong> leads with a projected future value of{' '}
              <strong>{formatCurrency(bestResult.futureValue)}</strong> at{' '}
              {formatPercent(bestResult.capmReturn)} CAPM return.
            </p>
            <div className="latest-calc-actions">
              <Link to="/analytics" className="cta-button">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                View Analytics
              </Link>
              <Link to="/portfolio" className="cta-button-bordered">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                View Portfolio
              </Link>
            </div>
          </div>

          <div className="panel quick-stats-panel">
            <h2 className="quick-stats-title">Quick Stats</h2>
            <div className="quick-stats-rows">
              <div className="quick-stat-row">
                <span className="quick-stat-label">Risk-Free Rate</span>
                <span className="quick-stat-value">{formatPercent(primaryResult.riskFreeRate)}</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Market Premium</span>
                <span className="quick-stat-value">
                  {formatPercent(primaryResult.expectedMarketReturn - primaryResult.riskFreeRate)}
                </span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Expected Return</span>
                <span className="quick-stat-value gold">{formatPercent(bestResult.capmReturn)}</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Time Horizon</span>
                <span className="quick-stat-value">{bestResult.years} years</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Initial Investment</span>
                <span className="quick-stat-value">{formatCurrency(bestResult.initialInvestment)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default DashboardView
