import { useEffect, useRef, useState } from 'react'
import CalculatorForm from '../components/CalculatorForm'
import ResultPanel from '../components/ResultPanel'
import StatusBanner from '../components/StatusBanner'
import { useAppContext } from '../context/AppContext'

const timeAgo = (ts) => {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

const CalculatorView = () => {
  const {
    assets, form, fieldErrors, results, hasResults,
    isCalculating, isLoadingAssets, isStale,
    riskFreeRate, statusMessage,
    handleChange, handleToggleTicker, handleSubmit,
  } = useAppContext()

  const [lastCalculatedAt, setLastCalculatedAt] = useState(null)
  const [, setTick] = useState(0)
  const resultCountRef = useRef(Object.keys(results).length)

  // Track when results change (new calculation completed)
  useEffect(() => {
    const newCount = Object.keys(results).length
    if (newCount > 0 && newCount !== resultCountRef.current) {
      setLastCalculatedAt(Date.now())
    }
    resultCountRef.current = newCount
  }, [results])

  // Also set timestamp when calculation finishes
  useEffect(() => {
    if (!isCalculating && hasResults) {
      setLastCalculatedAt(Date.now())
    }
  }, [isCalculating, hasResults])

  // Tick every 10s to refresh "Updated Xs ago"
  useEffect(() => {
    if (!lastCalculatedAt) return
    const interval = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(interval)
  }, [lastCalculatedAt])

  return (
    <main className="main-content">
      <StatusBanner type={statusMessage?.type} message={statusMessage?.message} />

      <div className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h2>Calculate</h2>
            <span className={`panel-badge ${isCalculating ? 'calculating' : 'ready'}`}>
              {isCalculating ? 'Calculating…' : 'Ready'}
            </span>
          </div>
          <CalculatorForm
            assets={assets}
            form={form}
            errors={fieldErrors}
            onChange={handleChange}
            onToggleTicker={handleToggleTicker}
            onSubmit={handleSubmit}
            isCalculating={isCalculating}
            isLoadingAssets={isLoadingAssets}
            riskFreeRate={riskFreeRate}
          />
        </article>

        <article className="panel results-panel">
          <div className="panel-header">
            <h2 className="result-panel-title">Result Details</h2>
            <div className="result-header-pills">
              {hasResults && lastCalculatedAt && (
                <span className="result-timestamp">Updated {timeAgo(lastCalculatedAt)}</span>
              )}
              {isStale && <span className="stale-pill">Stale</span>}
              {isCalculating && <span className="updating-pill">Updating…</span>}
              {hasResults && !isStale && !isCalculating && (
                <span className="live-badge"><span className="live-dot" /> LIVE</span>
              )}
            </div>
          </div>
          <ResultPanel results={results} isCalculating={isCalculating} isStale={isStale} />
        </article>
      </div>
    </main>
  )
}

export default CalculatorView
