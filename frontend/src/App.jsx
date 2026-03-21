import { useEffect, useMemo, useState } from 'react'
import './App.css'
import CalculatorForm from './components/CalculatorForm'
import GrowthChart from './components/GrowthChart'
import InsightsPanel from './components/InsightsPanel'
import ResultPanel from './components/ResultPanel'
import StatCard from './components/StatCard'
import StatusBanner from './components/StatusBanner'
import { calculateMultipleFunds, getMutualFunds } from './api/client'
import { formatCurrency, formatDecimal, formatPercent } from './utils/formatters'

const NavIcon = ({ type }) => {
  const icons = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    calculator: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" />
        <line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="10" x2="8" y2="10" />
        <line x1="12" y1="10" x2="12" y2="10" /><line x1="16" y1="10" x2="16" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" />
        <line x1="16" y1="14" x2="16" y2="18" /><line x1="8" y1="18" x2="12" y2="18" />
      </svg>
    ),
    portfolio: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    analytics: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  }
  return icons[type] || null
}

const REQUIRED_FIELDS = ['futureValue', 'capmReturn', 'expectedMarketReturn', 'beta', 'fundName', 'years', 'initialInvestment', 'riskFreeRate']

function App() {
  const [funds, setFunds] = useState([])
  const [form, setForm] = useState({
    tickers: [],
    investment: '10000',
    years: '10',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [results, setResults] = useState({})
  const [lastCalculatedForm, setLastCalculatedForm] = useState(null)
  const [isLoadingFunds, setIsLoadingFunds] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [calculationError, setCalculationError] = useState('')

  const resultTickers = Object.keys(results)
  const resultCount = resultTickers.length
  const hasResults = resultCount > 0
  const isMulti = resultCount > 1
  const primaryResult = hasResults ? results[resultTickers[0]] : null

  // For stat cards: show primary fund when 1, show best performer when multiple
  const bestResult = useMemo(() => {
    if (!hasResults) return null
    if (!isMulti) return primaryResult
    return Object.values(results).reduce((best, r) =>
      r.futureValue > best.futureValue ? r : best,
    )
  }, [results, hasResults, isMulti, primaryResult])

  useEffect(() => {
    const loadFunds = async () => {
      setIsLoadingFunds(true)
      setLoadError('')

      try {
        const data = await getMutualFunds()
        setFunds(data)

        if (data.length > 0) {
          setForm((previous) => ({
            ...previous,
            tickers: [data[0].ticker],
          }))
        }
      } catch (error) {
        setLoadError(error.message || 'Unable to load mutual funds.')
      } finally {
        setIsLoadingFunds(false)
      }
    }

    loadFunds()
  }, [])

  const validateForm = () => {
    const errors = {}

    if (form.tickers.length === 0) {
      errors.tickers = 'Please select at least one mutual fund.'
    }

    const parsedInvestment = Number(form.investment)
    if (!Number.isFinite(parsedInvestment) || parsedInvestment <= 0) {
      errors.investment = 'Investment must be greater than 0.'
    }

    const parsedYears = Number(form.years)
    if (!Number.isInteger(parsedYears) || parsedYears < 0 || parsedYears > 100) {
      errors.years = 'Years must be an integer from 0 to 100.'
    }

    return errors
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
    }))
    setCalculationError('')
  }

  const handleToggleTicker = (ticker) => {
    setForm((previous) => {
      const exists = previous.tickers.includes(ticker)
      return {
        ...previous,
        tickers: exists
          ? previous.tickers.filter((t) => t !== ticker)
          : [...previous.tickers, ticker],
      }
    })

    setFieldErrors((previous) => ({ ...previous, tickers: '' }))
    setCalculationError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setCalculationError('')
    setIsCalculating(true)

    try {
      const { results: newResults, errors: apiErrors } = await calculateMultipleFunds({
        tickers: form.tickers,
        investment: Number(form.investment),
        years: Number(form.years),
      })

      // Validate each result
      for (const [ticker, response] of Object.entries(newResults)) {
        const missing = REQUIRED_FIELDS.filter((f) => response[f] == null)
        if (missing.length > 0) {
          delete newResults[ticker]
          apiErrors[ticker] = 'Received incomplete data from the server.'
        }
      }

      if (Object.keys(newResults).length === 0) {
        const firstError = Object.values(apiErrors)[0] || 'All calculations failed.'
        throw new Error(firstError)
      }

      setResults(newResults)

      if (Object.keys(apiErrors).length > 0) {
        const failedTickers = Object.keys(apiErrors).join(', ')
        setCalculationError(`Some funds failed: ${failedTickers}`)
      }

      setLastCalculatedForm({
        tickers: [...form.tickers].sort(),
        investment: Number(form.investment),
        years: Number(form.years),
      })
    } catch (error) {
      setCalculationError(error.message || 'Unable to calculate future value.')
    } finally {
      setIsCalculating(false)
    }
  }

  const isStale = useMemo(() => {
    if (!hasResults || !lastCalculatedForm) {
      return false
    }

    return (
      JSON.stringify([...form.tickers].sort()) !== JSON.stringify(lastCalculatedForm.tickers) ||
      Number(form.investment) !== lastCalculatedForm.investment ||
      Number(form.years) !== lastCalculatedForm.years
    )
  }, [form, lastCalculatedForm, hasResults])

  const statusMessage = useMemo(() => {
    if (loadError) {
      return { type: 'error', message: loadError }
    }

    if (calculationError) {
      return { type: 'error', message: calculationError }
    }

    if (isLoadingFunds) {
      return { type: 'info', message: 'Loading mutual fund universe…' }
    }

    if (funds.length === 0) {
      return { type: 'warning', message: 'No mutual funds are currently available.' }
    }

    return null
  }, [loadError, calculationError, isLoadingFunds, funds.length])

  // First available riskFreeRate from any result
  const riskFreeRate = primaryResult?.riskFreeRate ?? null

  return (
    <div className="dashboard-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" stroke="white">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="sidebar-logo-text">CapmFlow</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <NavIcon type="dashboard" />
            Dashboard
          </button>
          <button className="nav-item">
            <NavIcon type="calculator" />
            Calculator
          </button>
          <button className="nav-item">
            <NavIcon type="portfolio" />
            Portfolio
          </button>
          <button className="nav-item">
            <NavIcon type="analytics" />
            Analytics
          </button>
          <button className="nav-item">
            <NavIcon type="settings" />
            Settings
          </button>
        </nav>
      </aside>

      {/* Main wrapper */}
      <div className="main-wrapper">
        {/* Top header */}
        <header className="top-header">
          <span className="top-header-title">CAPM Dashboard</span>
          <div className="top-header-actions">
            <div className="search-bar">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input type="text" placeholder="Search funds…" readOnly />
            </div>
            <button className="icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="main-content">
          <div className="page-hero">
            <h1>Investment Overview</h1>
            <p className="page-hero-sub">
              Track your CAPM inputs and get projected future value recommendations.
            </p>
          </div>

          {/* Stat cards */}
          <div className="stat-cards-row">
            <StatCard
              label={isMulti ? 'Best Future Value' : 'Future Value'}
              indicatorColor="green"
              value={bestResult ? formatCurrency(bestResult.futureValue) : null}
              subText={bestResult
                ? isMulti
                  ? `${bestResult.fundName}`
                  : `${formatCurrency(bestResult.initialInvestment)} invested over ${bestResult.years} yrs`
                : null}
              valueClassName="green"
              isLoading={isCalculating}
              hasError={!!calculationError && !hasResults}
            />
            <StatCard
              label={isMulti ? 'Best CAPM Return' : 'CAPM Return'}
              indicatorColor="blue"
              value={bestResult ? formatPercent(bestResult.capmReturn) : null}
              subText={bestResult
                ? isMulti
                  ? `${bestResult.fundName}`
                  : `CAPM rate for ${bestResult.fundName}`
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
              label={isMulti ? 'Funds Compared' : 'Beta'}
              indicatorColor="amber"
              value={hasResults
                ? isMulti
                  ? String(resultCount)
                  : formatDecimal(primaryResult.beta, 2)
                : null}
              subText={hasResults
                ? isMulti
                  ? `${resultTickers.join(', ')}`
                  : `Systematic risk for ${primaryResult.fundName}`
                : null}
              isLoading={isCalculating}
              hasError={!!calculationError && !hasResults}
            />
          </div>

          <StatusBanner type={statusMessage?.type} message={statusMessage?.message} />

          {/* Form + Results */}
          <div className="content-grid">
            <article className="panel">
              <div className="panel-header">
                <h2>Calculate</h2>
                <span className={`panel-badge ${isCalculating ? 'calculating' : 'ready'}`}>
                  {isCalculating ? 'Calculating…' : 'Ready'}
                </span>
              </div>
              <CalculatorForm
                funds={funds}
                form={form}
                errors={fieldErrors}
                onChange={handleChange}
                onToggleTicker={handleToggleTicker}
                onSubmit={handleSubmit}
                isCalculating={isCalculating}
                isLoadingFunds={isLoadingFunds}
                riskFreeRate={riskFreeRate}
              />
            </article>

            <article className="panel results-panel">
              <div className="panel-header">
                <h2>Result Details</h2>
                <div className="result-header-pills">
                  {isStale && <span className="stale-pill">Stale</span>}
                  {isCalculating && <span className="updating-pill">Updating…</span>}
                </div>
              </div>
              <ResultPanel results={results} isCalculating={isCalculating} isStale={isStale} />
            </article>
          </div>

          <article className="panel insights-panel">
            <div className="panel-header">
              <h2>Insights</h2>
              {isStale && <span className="stale-pill">Stale</span>}
            </div>
            <InsightsPanel results={results} isCalculating={isCalculating} />
          </article>

          <article className="panel chart-panel">
            <div className="panel-header">
              <h2>Projected Growth</h2>
              {isStale && <span className="stale-pill">Stale</span>}
            </div>
            <GrowthChart results={results} isCalculating={isCalculating} />
          </article>
        </main>
      </div>
    </div>
  )
}

export default App
