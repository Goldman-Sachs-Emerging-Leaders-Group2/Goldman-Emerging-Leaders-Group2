import { formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const MAX_SELECTIONS = 5

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
}) => {
  const atMax = form.tickers.length >= MAX_SELECTIONS

  return (
    <form className="calculator-form" onSubmit={onSubmit} noValidate>
      <div className="field-group">
        <label>Mutual Funds <span className="field-hint">({form.tickers.length}/{MAX_SELECTIONS})</span></label>
        <div className="fund-checkbox-list">
          {funds.length === 0 && (
            <p className="fund-checkbox-empty">No funds available</p>
          )}
          {funds.map((fund, index) => {
            const checked = form.tickers.includes(fund.ticker)
            return (
              <label
                key={fund.ticker}
                className={`fund-checkbox-item${checked ? ' checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTicker(fund.ticker)}
                  disabled={isLoadingFunds || isCalculating || (!checked && atMax)}
                />
                <span
                  className="fund-checkbox-color"
                  style={{ backgroundColor: checked ? getFundColor(form.tickers.indexOf(fund.ticker)) : '#2a3f54' }}
                />
                <span className="fund-checkbox-label">
                  {fund.ticker} — {fund.name} ({formatPercent(fund.expectedAnnualReturn)})
                </span>
              </label>
            )
          })}
        </div>
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
          <label htmlFor="years">Terms (Years)</label>
          <input
            id="years"
            name="years"
            type="number"
            inputMode="numeric"
            min="0"
            max="100"
            step="1"
            value={form.years}
            onChange={onChange}
            placeholder="e.g. 10"
            disabled={isCalculating}
          />
          {errors.years && <p className="field-error">{errors.years}</p>}
        </div>
      </div>

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

      <button
        type="submit"
        className="calculate-button"
        disabled={isCalculating || isLoadingFunds || funds.length === 0}
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        {isCalculating ? 'Calculating…' : 'Calculate Future Value'}
      </button>
    </form>
  )
}

export default CalculatorForm
