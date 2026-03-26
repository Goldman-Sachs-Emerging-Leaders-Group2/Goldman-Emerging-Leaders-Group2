import { useState } from 'react'
import { formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const MAX_SELECTIONS = 5
const ETF_TICKERS = new Set(['SPY', 'QQQ', 'VTI', 'SCHD', 'ARKK'])

const RISK_LABELS = { low: 'Conservative', mid: 'Moderate', high: 'Aggressive' }
const getRiskLabel = (val) => val <= 3 ? RISK_LABELS.low : val <= 6 ? RISK_LABELS.mid : RISK_LABELS.high

const CalculatorForm = ({
  funds,
  form,
  errors,
  onChange,
  onToggleTicker,
  onSubmit,
  isCalculating,
  isLoadingFunds,
  goalAmount,
  onGoalChange,
  monthlyContribution,
  onMonthlyChange,
  riskTolerance,
  onRiskToleranceChange,
  customTickers,
  onAddCustomTicker,
  onRemoveCustomTicker,
}) => {
  const atMax = form.tickers.length >= MAX_SELECTIONS
  const [fundTab, setFundTab] = useState('mf')
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState('')

  const mutualFunds = funds.filter(f => !ETF_TICKERS.has(f.ticker))
  const etfs = funds.filter(f => ETF_TICKERS.has(f.ticker))
  const visibleFunds = fundTab === 'mf' ? mutualFunds : etfs

  const mfSelected = form.tickers.filter(t => !ETF_TICKERS.has(t)).length
  const etfSelected = form.tickers.filter(t => ETF_TICKERS.has(t)).length

  const tryAddCustom = (ticker) => {
    if (!ticker || ticker.length < 1 || ticker.length > 5 || atMax) return
    if (form.tickers.includes(ticker)) {
      setDuplicateWarning(`${ticker} is already selected`)
      setTimeout(() => setDuplicateWarning(''), 2000)
      setCustomInput('')
      return
    }
    setDuplicateWarning('')
    onAddCustomTicker(ticker)
    setCustomInput('')
  }

  return (
    <form className="grid gap-[0.8rem]" onSubmit={onSubmit} noValidate>
      <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
        <label>Select Funds <span className="text-[0.72rem] font-normal text-[var(--text-muted)]">({form.tickers.length}/{MAX_SELECTIONS})</span></label>

        <div className="mb-[0.4rem]">
          <div className="inline-flex gap-1">
            <button
              type="button"
              className={`border-none bg-transparent px-[0.85rem] py-[0.4rem] text-[0.78rem] font-semibold cursor-pointer rounded-[6px] whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                fundTab === 'mf'
                  ? 'bg-[rgba(181,152,90,0.15)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[rgba(181,152,90,0.06)] hover:text-[var(--text-secondary)]'
              }`}
              onClick={() => setFundTab('mf')}
            >
              Mutual Funds ({mutualFunds.length}){mfSelected > 0 && <span className="font-medium opacity-80"> &middot; {mfSelected} selected</span>}
            </button>
            <button
              type="button"
              className={`border-none bg-transparent px-[0.85rem] py-[0.4rem] text-[0.78rem] font-semibold cursor-pointer rounded-[6px] whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                fundTab === 'etfs'
                  ? 'bg-[rgba(181,152,90,0.15)] text-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:bg-[rgba(181,152,90,0.06)] hover:text-[var(--text-secondary)]'
              }`}
              onClick={() => setFundTab('etfs')}
            >
              ETFs ({etfs.length}){etfSelected > 0 && <span className="font-medium opacity-80"> &middot; {etfSelected} selected</span>}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
          {visibleFunds.length === 0 && funds.length === 0 && (
            <p className="m-0 text-[var(--text-muted)] text-[0.82rem] p-3 col-span-full">
              {isLoadingFunds ? 'Loading funds\u2026' : 'No funds available'}
            </p>
          )}
          {visibleFunds.map((fund) => {
            const checked = form.tickers.includes(fund.ticker)
            const colorIndex = checked ? form.tickers.indexOf(fund.ticker) : -1
            return (
              <label
                key={fund.ticker}
                className={`relative flex flex-col gap-[0.2rem] p-[0.7rem] rounded-[10px] border-2 cursor-pointer transition-all duration-200 ${
                  checked
                    ? 'border-[var(--accent)] shadow-[0_4px_16px_rgba(181,152,90,0.2)]'
                    : 'border-[var(--card-border)] hover:border-[var(--accent-light)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,36,77,0.1)]'
                }${!checked && atMax ? ' opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                style={{ background: 'var(--card-bg)' }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTicker(fund.ticker)}
                  disabled={isLoadingFunds || isCalculating || (!checked && atMax)}
                  className="sr-only"
                />
                <span
                  className={`absolute top-2 right-2 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[0.6rem] font-bold transition-all duration-200 ${
                    checked
                      ? 'bg-[var(--accent)] border-[var(--accent)] text-[var(--navy-dark)]'
                      : 'border-[var(--card-border)] text-[var(--navy-dark)]'
                  }`}
                  aria-hidden="true"
                >
                  {checked ? '\u2713' : ''}
                </span>
                <span
                  className="w-2 h-2 rounded-full mb-[0.2rem]"
                  style={{ backgroundColor: checked ? getFundColor(colorIndex) : 'var(--input-border, #D1D5DB)' }}
                />
                <span className="text-base font-bold text-[var(--text-primary)]">{fund.ticker}</span>
                <span className="text-[0.72rem] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis">{fund.name}</span>
                <span className="text-[0.82rem] font-semibold text-[var(--success)] mt-[0.15rem]">{formatPercent(fund.expectedAnnualReturn)}</span>
              </label>
            )
          })}
        </div>

        {/* Custom ticker chips */}
        {customTickers && customTickers.length > 0 && (
          <div className="flex flex-wrap gap-[0.35rem]">
            {customTickers.map((t) => (
              <span key={t} className="inline-flex items-center gap-[0.3rem] bg-[rgba(181,152,90,0.12)] text-[var(--accent)] text-[0.75rem] font-semibold px-2 py-1 rounded-[5px]">
                {t}
                <button
                  type="button"
                  className="border-none bg-transparent text-[var(--text-muted)] text-[0.85rem] cursor-pointer p-0 leading-none transition-colors duration-150 hover:text-[var(--error)]"
                  onClick={() => onRemoveCustomTicker(t)}
                  aria-label={`Remove ${t}`}
                >&times;</button>
              </span>
            ))}
          </div>
        )}

        {/* Custom ticker search — expandable */}
        {!showCustom ? (
          <button
            type="button"
            className="border-none bg-transparent text-[var(--text-muted)] text-[0.75rem] font-medium cursor-pointer py-[0.3rem] px-0 transition-colors duration-200 hover:text-[var(--accent)]"
            onClick={() => setShowCustom(true)}
          >
            + Search any ticker
          </button>
        ) : (
          <div className="flex gap-2 items-center">
            <input
              type="text"
              className="flex-1 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] rounded-[6px] px-[0.6rem] py-[0.35rem] text-[0.78rem] font-[inherit] outline-none transition-colors duration-200 focus:border-[var(--accent)]"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  tryAddCustom(customInput)
                }
                if (e.key === 'Escape') {
                  setShowCustom(false)
                  setCustomInput('')
                  setDuplicateWarning('')
                }
              }}
              placeholder="e.g. AAPL, MSFT, GOOGL"
              disabled={isCalculating || atMax}
              autoFocus
            />
            <button
              type="button"
              className="border-none bg-[var(--accent)] text-[#00244D] text-[0.75rem] font-semibold px-3 py-[0.35rem] rounded-[6px] cursor-pointer transition-opacity duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={customInput.length < 1 || customInput.length > 5 || atMax}
              onClick={() => tryAddCustom(customInput)}
            >
              Add
            </button>
          </div>
        )}

        {duplicateWarning && <p className="text-[0.72rem] font-normal text-[var(--accent)]! animate-[fadeIn_0.2s_ease-out]">{duplicateWarning}</p>}
        {errors.tickers && <p className="m-0 text-[var(--error)] text-[0.775rem]">{errors.tickers}</p>}
      </div>

      <div className="grid grid-cols-2 gap-[0.8rem] max-md:grid-cols-1">
        <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
          <label htmlFor="investment">Initial Investment ($)</label>
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
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] px-3 py-[0.65rem] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--input-focus-shadow)] disabled:opacity-50"
          />
          {errors.investment && <p className="m-0 text-[var(--error)] text-[0.775rem]">{errors.investment}</p>}
        </div>

        <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
          <label htmlFor="monthlyContribution">Monthly Contribution ($) <span className="text-[0.72rem] font-normal text-[var(--text-muted)]">(optional)</span></label>
          <input
            id="monthlyContribution"
            name="monthlyContribution"
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={monthlyContribution}
            onChange={onMonthlyChange}
            placeholder="e.g. 500"
            disabled={isCalculating}
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] px-3 py-[0.65rem] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--input-focus-shadow)] disabled:opacity-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[0.8rem] max-md:grid-cols-1">
        <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
          <label htmlFor="years">Investment Duration</label>
          <div className="flex items-center gap-4">
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
              className="flex-1 appearance-none h-[6px] rounded-[3px] bg-[var(--input-border)] outline-none !border-none !p-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00244D] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-[#B5985A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb:hover]:scale-[1.15] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00244D] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[#B5985A] [&::-moz-range-thumb]:cursor-pointer"
            />
            <span className="text-[0.9rem] font-semibold text-[var(--text-primary)] whitespace-nowrap min-w-[60px]">{form.years || 10} years</span>
          </div>
          {errors.years && <p className="m-0 text-[var(--error)] text-[0.775rem]">{errors.years}</p>}
        </div>

        <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
          <label htmlFor="goalAmount">Goal Amount ($) <span className="text-[0.72rem] font-normal text-[var(--text-muted)]">(optional)</span></label>
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
            className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] px-3 py-[0.65rem] text-sm transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[var(--input-focus-shadow)] disabled:opacity-50"
          />
        </div>

        <div className="grid gap-[0.4rem] [&>label]:text-[0.82rem] [&>label]:font-semibold [&>label]:text-[var(--text-secondary)] [&>label]:tracking-[0.01em]">
          <label htmlFor="riskTolerance">Risk Tolerance</label>
        <div className="flex items-center gap-4">
          <input
            id="riskTolerance"
            name="riskTolerance"
            type="range"
            min="1"
            max="10"
            step="1"
            value={riskTolerance}
            onChange={onRiskToleranceChange}
            disabled={isCalculating}
            className="flex-1 appearance-none h-[6px] rounded-[3px] bg-[var(--input-border)] outline-none !border-none !p-0 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#00244D] [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-[#B5985A] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb:hover]:scale-[1.15] [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#00244D] [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-[#B5985A] [&::-moz-range-thumb]:cursor-pointer"
          />
          <span className="text-[0.9rem] font-semibold text-[var(--text-primary)] whitespace-nowrap min-w-[60px]">{riskTolerance}/10 &middot; {getRiskLabel(riskTolerance)}</span>
        </div>
      </div>
      </div>

      <button
        type="submit"
        className="mt-2 border-none rounded-[10px] bg-[#00244D] text-white px-5 py-[0.8rem] font-semibold text-[0.95rem] flex items-center justify-center gap-2 transition-all duration-250 w-full hover:enabled:bg-[#B5985A] hover:enabled:text-[#00244D] hover:enabled:-translate-y-px hover:enabled:shadow-[0_4px_16px_rgba(181,152,90,0.3)] disabled:opacity-40 disabled:cursor-not-allowed [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-current"
        disabled={isCalculating || isLoadingFunds || funds.length === 0}
      >
        {isCalculating ? (
          'Calculating\u2026'
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
