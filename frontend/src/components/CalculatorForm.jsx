import { useState } from 'react'
import { formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const MAX_SELECTIONS = 5
const ETF_TICKERS = new Set(['SPY', 'QQQ', 'VTI', 'SCHD', 'ARKK'])

const CalculatorForm = ({
  funds,
  form,
  errors,
  onChange,
  onToggleTicker,
  onSubmit,
  isCalculating,
  isLoadingFunds,
  riskFreeRate,
  goalAmount,
  onGoalChange,
  customTickers,
  onAddCustomTicker,
  onRemoveCustomTicker,
}) => {
  const atMax = form.tickers.length >= MAX_SELECTIONS
  const [fundTab, setFundTab] = useState('mf')
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')

  const mutualFunds = funds.filter(f => !ETF_TICKERS.has(f.ticker))
  const etfs = funds.filter(f => ETF_TICKERS.has(f.ticker))
  const visibleFunds = fundTab === 'mf' ? mutualFunds : etfs

  const mfSelected = form.tickers.filter(t => !ETF_TICKERS.has(t)).length
  const etfSelected = form.tickers.filter(t => ETF_TICKERS.has(t)).length

  return (
    <form className="calculator-form" onSubmit={onSubmit} noValidate>
      <div className="field-group">
        <label>Select Funds <span className="field-hint">({form.tickers.length}/{MAX_SELECTIONS})</span></label>

        <div className="fund-toggle">
          <div className="fund-toggle__track">
            <button
              type="button"
              className={`fund-toggle__btn${fundTab === 'mf' ? ' fund-toggle__btn--active' : ''}`}
              onClick={() => setFundTab('mf')}
            >
              Mutual Funds ({mutualFunds.length}){mfSelected > 0 && <span className="fund-toggle__selected"> · {mfSelected} selected</span>}
            </button>
            <button
              type="button"
              className={`fund-toggle__btn${fundTab === 'etfs' ? ' fund-toggle__btn--active' : ''}`}
              onClick={() => setFundTab('etfs')}
            >
              ETFs ({etfs.length}){etfSelected > 0 && <span className="fund-toggle__selected"> · {etfSelected} selected</span>}
            </button>
          </div>
        </div>

        <div className="fund-card-grid">
          {visibleFunds.length === 0 && funds.length === 0 && (
            <p className="fund-checkbox-empty">
              {isLoadingFunds ? 'Loading funds…' : 'No funds available'}
            </p>
          )}
          {visibleFunds.map((fund) => {
            const checked = form.tickers.includes(fund.ticker)
            const colorIndex = checked ? form.tickers.indexOf(fund.ticker) : -1
            return (
              <label
                key={fund.ticker}
                className={`fund-card${checked ? ' fund-card--selected' : ''}${!checked && atMax ? ' fund-card--disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTicker(fund.ticker)}
                  disabled={isLoadingFunds || isCalculating || (!checked && atMax)}
                  className="sr-only"
                />
                <span className="fund-card__check" aria-hidden="true">
                  {checked ? '✓' : ''}
                </span>
                <span
                  className="fund-card__color"
                  style={{ backgroundColor: checked ? getFundColor(colorIndex) : 'var(--input-border, #D1D5DB)' }}
                />
                <span className="fund-card__ticker">{fund.ticker}</span>
                <span className="fund-card__name">{fund.name}</span>
                <span className="fund-card__return">{formatPercent(fund.expectedAnnualReturn)}</span>
              </label>
            )
          })}
        </div>
        {/* Custom ticker chips */}
        {customTickers && customTickers.length > 0 && (
          <div className="custom-chips">
            {customTickers.map((t) => (
              <span key={t} className="custom-chip">
                {t}
                <button
                  type="button"
                  className="custom-chip__remove"
                  onClick={() => onRemoveCustomTicker(t)}
                  aria-label={`Remove ${t}`}
                >×</button>
              </span>
            ))}
          </div>
        )}

        {/* Custom ticker search — expandable */}
        {!showCustom ? (
          <button
            type="button"
            className="custom-search-trigger"
            onClick={() => setShowCustom(true)}
          >
            + Search any ticker
          </button>
        ) : (
          <div className="custom-search">
            <input
              type="text"
              className="custom-search__input"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (customInput.length >= 1 && customInput.length <= 5 && !atMax) {
                    onAddCustomTicker(customInput)
                    setCustomInput('')
                  }
                }
                if (e.key === 'Escape') {
                  setShowCustom(false)
                  setCustomInput('')
                }
              }}
              placeholder="e.g. AAPL, MSFT, GOOGL"
              disabled={isCalculating || atMax}
              autoFocus
            />
            <button
              type="button"
              className="custom-search__add"
              disabled={customInput.length < 1 || customInput.length > 5 || atMax}
              onClick={() => {
                if (customInput.length >= 1 && customInput.length <= 5) {
                  onAddCustomTicker(customInput)
                  setCustomInput('')
                }
              }}
            >
              Add
            </button>
          </div>
        )}

        {errors.tickers && <p className="field-error">{errors.tickers}</p>}
      </div>

      <div className="form-row">
        <div className="field-group">
          <label htmlFor="investment">Investment ($)</label>
          <input
            id="investment"
            name="investment"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.investment}
            onChange={onChange}
            placeholder="e.g. 10000"
            disabled={isCalculating}
          />
          {errors.investment && <p className="field-error">{errors.investment}</p>}
        </div>

        <div className="field-group">
          <label htmlFor="years">Investment Duration</label>
          <div className="slider-group">
            <input
              id="years"
              name="years"
              type="range"
              min="1"
              max="50"
              step="1"
              value={form.years || 10}
              onChange={onChange}
              disabled={isCalculating}
              className="years-slider"
            />
            <span className="slider-value">{form.years || 10} years</span>
          </div>
          {errors.years && <p className="field-error">{errors.years}</p>}
        </div>
      </div>

      <div className="form-row">
        <div className="field-group">
          <label>Risk-Free Rate <span className="field-hint">(from server)</span></label>
          <input
            type="text"
            value={riskFreeRate != null ? formatPercent(riskFreeRate) : '—'}
            readOnly
            disabled
            aria-label="Risk-free rate from last calculation"
          />
        </div>

        <div className="field-group">
          <label htmlFor="goalAmount">Goal Amount <span className="field-hint">(optional)</span></label>
          <input
            id="goalAmount"
            name="goalAmount"
            type="number"
            inputMode="decimal"
            min="0"
            step="1000"
            value={goalAmount}
            onChange={onGoalChange}
            placeholder="e.g. 50000"
            disabled={isCalculating}
          />
        </div>
      </div>

      <button
        type="submit"
        className="calculate-button"
        disabled={isCalculating || isLoadingFunds || funds.length === 0}
      >
        {isCalculating ? (
          'Calculating…'
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Calculate Future Value
          </>
        )}
      </button>
    </form>
  )
}

export default CalculatorForm
