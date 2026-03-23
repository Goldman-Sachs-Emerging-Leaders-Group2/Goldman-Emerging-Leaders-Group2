import { useEffect, useMemo, useState } from 'react'
import './App.css'
import CalculatorForm from './components/CalculatorForm'
import GrowthChart from './components/GrowthChart'
import InsightsPanel from './components/InsightsPanel'
import ResultPanel from './components/ResultPanel'
import PieBreakdown from './components/PieBreakdown'
import { calculateMultipleFunds, getMutualFunds } from './api/client'
import { formatCurrency, formatPercent } from './utils/formatters'
import { generateNarrative, generateComparisonNarrative } from './utils/narrative'

const REQUIRED_FIELDS = ['ticker', 'futureValue', 'capmReturn', 'expectedMarketReturn', 'beta', 'fundName', 'years', 'initialInvestment', 'riskFreeRate']

const smoothScrollTo = (element, duration = 1200) => {
  if (!element) return
  const targetY = element.getBoundingClientRect().top + window.scrollY - 20
  const startY = window.scrollY
  const diff = targetY - startY
  if (Math.abs(diff) < 5) return
  const startTime = performance.now()

  const step = (now) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 4)
    window.scrollTo(0, startY + diff * eased)
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

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
  const [goalAmount, setGoalAmount] = useState('')
  const [theme, setTheme] = useState(() => localStorage.getItem('gs-theme') || 'light')
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [customTickers, setCustomTickers] = useState([])

  const handleAddCustomTicker = (ticker) => {
    const t = ticker.toUpperCase()
    if (customTickers.includes(t) || form.tickers.includes(t)) return
    setCustomTickers(prev => [...prev, t])
    handleToggleTicker(t)
  }

  const handleRemoveCustomTicker = (ticker) => {
    setCustomTickers(prev => prev.filter(t => t !== ticker))
    if (form.tickers.includes(ticker)) {
      handleToggleTicker(ticker)
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('gs-theme', theme)
  }, [theme])

  const resultTickers = Object.keys(results)
  const resultCount = resultTickers.length
  const hasResults = resultCount > 0
  const isMulti = resultCount > 1
  const primaryResult = hasResults ? results[resultTickers[0]] : null

  const bestResult = useMemo(() => {
    if (!hasResults) return null
    if (!isMulti) return primaryResult
    return Object.values(results).reduce((best, r) =>
      r.futureValue > best.futureValue ? r : best,
    )
  }, [results, hasResults, isMulti, primaryResult])

  const bestCapmResult = useMemo(() => {
    if (!hasResults) return null
    return Object.values(results).reduce((best, r) =>
      r.capmReturn > best.capmReturn ? r : best,
    )
  }, [results, hasResults])

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
      setFormCollapsed(true)

      if (Object.keys(apiErrors).length > 0) {
        const failedTickers = Object.keys(apiErrors).join(', ')
        setCalculationError(`Some funds failed: ${failedTickers}`)
      }

      setLastCalculatedForm({
        tickers: [...form.tickers].sort(),
        investment: Number(form.investment),
        years: Number(form.years),
      })

      setTimeout(() => {
        smoothScrollTo(document.querySelector('.form-summary'))
      }, 700)
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

  const riskFreeRate = primaryResult?.riskFreeRate ?? null

  // Results narrative
  const narrative = useMemo(() => {
    if (!hasResults) return null
    if (isMulti) return generateComparisonNarrative(results)
    return generateNarrative(primaryResult)
  }, [results, hasResults, isMulti, primaryResult])

  return (
    <div className="app">
      {/* Header */}
      <header className="gs-header">
        <div className="gs-header-inner">
          <div className="gs-header-brand">
            <div className="gs-logo-mark">GS</div>
            <div className="gs-header-text">
              <span className="gs-header-title">Goldman Sachs</span>
              <span className="gs-header-subtitle">Emerging Leaders Program</span>
            </div>
          </div>
          <div className="gs-header-right">
            <button
              className="theme-toggle"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <span className="gs-header-badge">Group 2</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="gs-hero">
        <h1>Mutual Fund Investment Calculator</h1>
        <p>Select funds, enter your investment, and see projected returns using the Capital Asset Pricing Model.</p>
      </section>

      {/* Alerts */}
      {loadError && (
        <div className="gs-alert gs-alert-error">{loadError}</div>
      )}
      {calculationError && (
        <div className="gs-alert gs-alert-error">{calculationError}</div>
      )}
      {isLoadingFunds && (
        <div className="gs-alert gs-alert-info">Loading mutual fund data…</div>
      )}

      {/* Main Content */}
      <main className="gs-main">
        {/* Calculator */}
        <section className="gs-card">
          {/* Summary bar — visible when collapsed */}
          <div className={`form-summary-wrapper${formCollapsed ? ' form-summary-wrapper--visible' : ''}`}>
            {hasResults && (
              <div
                className="form-summary"
                onClick={() => setFormCollapsed(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setFormCollapsed(false)}
              >
                <div className="form-summary__params">
                  <span className="form-summary__tag">{form.tickers.join(', ')}</span>
                  <span className="form-summary__sep" aria-hidden="true" />
                  <span className="form-summary__tag">${Number(form.investment).toLocaleString()}</span>
                  <span className="form-summary__sep" aria-hidden="true" />
                  <span className="form-summary__tag">{form.years} years</span>
                </div>
                <button
                  className="form-summary__modify"
                  onClick={(e) => { e.stopPropagation(); setFormCollapsed(false) }}
                >
                  Modify
                </button>
              </div>
            )}
          </div>

          {/* Full form — visible when expanded */}
          <div className={`form-full-wrapper${formCollapsed ? ' form-full-wrapper--hidden' : ''}`}>
            <div className="gs-card-header">
              <h2>Investment Parameters</h2>
              <span className={`gs-badge ${isCalculating ? 'calculating' : 'ready'}`}>
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
              goalAmount={goalAmount}
              onGoalChange={(e) => setGoalAmount(e.target.value)}
              customTickers={customTickers}
              onAddCustomTicker={handleAddCustomTicker}
              onRemoveCustomTicker={handleRemoveCustomTicker}
            />
          </div>
        </section>

        {/* Results — reveals after calculation */}
        {hasResults && (
          <section className="results-section">
            {narrative && (
              <p className="results-narrative">{narrative}</p>
            )}

            <div className="summary-stats" id="results-section">
              <div className="stat-card">
                <span className="stat-card__label">Best Future Value</span>
                <span className="stat-card__value">{formatCurrency(bestResult.futureValue)}</span>
                <span className="stat-card__sub">{bestResult.fundName}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Best CAPM Return</span>
                <span className="stat-card__value">{formatPercent(bestCapmResult.capmReturn)}</span>
                <span className="stat-card__sub">{bestCapmResult.fundName}</span>
              </div>
              <div className="stat-card">
                <span className="stat-card__label">Funds Compared</span>
                <span className="stat-card__value">{resultCount}</span>
                <span className="stat-card__sub">{resultCount === 1 ? 'single fund' : 'multi-fund comparison'}</span>
              </div>
            </div>

            <div className="results-grid">
              <div className="gs-card">
                <div className="gs-card-header">
                  <h2>Projected Results</h2>
                  <div className="gs-badge-group">
                    {isStale && <span className="gs-badge stale">Stale</span>}
                    {isCalculating && <span className="gs-badge calculating">Updating…</span>}
                  </div>
                </div>
                <ResultPanel results={results} isCalculating={isCalculating} isStale={isStale} />
              </div>

              <div className="gs-card">
                <div className="gs-card-header">
                  <h2>Investment Breakdown</h2>
                </div>
                <PieBreakdown result={bestResult} isMulti={isMulti} />
              </div>
            </div>

            <div className="gs-card">
              <div className="gs-card-header">
                <h2>Projected Growth</h2>
                {isStale && <span className="gs-badge stale">Stale</span>}
              </div>
              <GrowthChart results={results} isCalculating={isCalculating} goalAmount={goalAmount} />
            </div>

            <div className="gs-card">
              <div className="gs-card-header">
                <h2>Investment Insights</h2>
                {isStale && <span className="gs-badge stale">Stale</span>}
              </div>
              <InsightsPanel results={results} isCalculating={isCalculating} />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="gs-footer">
        <div className="gs-footer-divider" />
        <p>Goldman Sachs Emerging Leaders Program — Group 2</p>
        <p className="gs-footer-attribution">
          Market data from Newton Analytics and Yahoo Finance. CAPM projections are estimates, not financial advice.
        </p>
      </footer>
    </div>
  )
}

export default App
