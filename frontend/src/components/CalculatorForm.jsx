import { formatPercent } from '../utils/formatters'
import { getAssetColor } from '../utils/colors'

const MAX_SELECTIONS = 5

const TYPE_LABELS = {
  MUTUAL_FUND: 'MF',
  ETF: 'ETF',
}

const CalculatorForm = ({
  assets,
  form,
  errors,
  onChange,
  onToggleTicker,
  onSubmit,
  isCalculating,
  isLoadingAssets,
  riskFreeRate,
}) => {
  const atMax = form.tickers.length >= MAX_SELECTIONS

  return (
    <form className="calculator-form" onSubmit={onSubmit} noValidate>
      <div className="field-group">
        <label>Assets <span className="field-hint">({form.tickers.length}/{MAX_SELECTIONS})</span></label>
        <div className="asset-checkbox-list">
          {assets.length === 0 && (
            <p className="asset-checkbox-empty">No assets available</p>
          )}
          {assets.map((asset) => {
            const checked = form.tickers.includes(asset.ticker)
            return (
              <label
                key={asset.ticker}
                className={`asset-checkbox-item${checked ? ' checked' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTicker(asset.ticker)}
                  disabled={isLoadingAssets || isCalculating || (!checked && atMax)}
                />
                <span
                  className="asset-checkbox-color"
                  style={{ backgroundColor: checked ? getAssetColor(form.tickers.indexOf(asset.ticker)) : '#2a3f54' }}
                />
                <span className="asset-type-badge">{TYPE_LABELS[asset.type] || asset.type}</span>
                <span className="asset-checkbox-label">
                  {asset.ticker} — {asset.name} ({formatPercent(asset.expectedAnnualReturn)})
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
        disabled={isCalculating || isLoadingAssets || assets.length === 0}
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
