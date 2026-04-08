import { useState } from 'react'
import { formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const MAX_SELECTIONS = 5
const ETF_TICKERS = new Set(['SPY', 'QQQ', 'VTI', 'SCHD', 'ARKK'])

const RISK_LABELS = { low: 'Conservative', mid: 'Moderate', high: 'Aggressive' }
const getRiskLabel = (value) => (value <= 3 ? RISK_LABELS.low : value <= 6 ? RISK_LABELS.mid : RISK_LABELS.high)

function SectionHeading({ eyebrow, title, description, aside }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
      <div className="max-w-[54ch]">
        <p className="northline-eyebrow mb-2">{eyebrow}</p>
        <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
          {description}
        </p>
      </div>
      {aside && (
        <span className="northline-chip self-start">
          {aside}
        </span>
      )}
    </div>
  )
}

function InputField({ label, optional, error, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[color:var(--text-primary)]">
        {label}
        {optional && <span className="ml-1 font-normal text-[color:var(--text-muted)]">(optional)</span>}
      </span>
      {children}
      {error && <span className="text-sm text-[color:var(--error)]">{error}</span>}
    </label>
  )
}

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
  customTickers = [],
  onAddCustomTicker,
  onRemoveCustomTicker,
}) => {
  const atMax = form.tickers.length >= MAX_SELECTIONS
  const [fundTab, setFundTab] = useState('mf')
  const [showCustom, setShowCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const [duplicateWarning, setDuplicateWarning] = useState('')

  const mutualFunds = funds.filter((fund) => !ETF_TICKERS.has(fund.ticker))
  const etfs = funds.filter((fund) => ETF_TICKERS.has(fund.ticker))
  const visibleFunds = fundTab === 'mf' ? mutualFunds : etfs

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
    <form className="grid gap-8" onSubmit={onSubmit} noValidate>
      <section className="northline-card rounded-[28px] p-5 sm:p-6">
        <SectionHeading
          eyebrow="Choose funds"
          title="Pick the funds you want to compare."
          description="Northline keeps every fund on the same starting balance, monthly contribution, and timeline so the comparison stays fair."
          aside={`${form.tickers.length}/${MAX_SELECTIONS} selected`}
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            className={`northline-tab ${fundTab === 'mf' ? 'is-active' : ''}`}
            onClick={() => setFundTab('mf')}
          >
            Mutual funds
          </button>
          <button
            type="button"
            className={`northline-tab ${fundTab === 'etfs' ? 'is-active' : ''}`}
            onClick={() => setFundTab('etfs')}
          >
            Benchmarks & ETFs
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[color:var(--text-secondary)]">
          Mutual funds are the primary planning path. Add a benchmark ETF only if you want a market reference alongside the funds you are seriously considering.
        </p>

        {atMax && (
          <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
            You have reached the comparison limit. Remove one selection to add another fund.
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visibleFunds.length === 0 && funds.length === 0 && (
            <div className="northline-empty-state md:col-span-2 xl:col-span-3">
              {isLoadingFunds ? 'Loading funds…' : 'No funds available'}
            </div>
          )}

          {visibleFunds.map((fund) => {
            const checked = form.tickers.includes(fund.ticker)
            const colorIndex = checked ? form.tickers.indexOf(fund.ticker) : 0

            return (
              <label
                key={fund.ticker}
                className={[
                  'group relative flex min-h-[172px] cursor-pointer flex-col rounded-[24px] border p-4 transition duration-200',
                  checked
                    ? 'border-[color:var(--signal)] bg-[color:var(--surface-strong)] shadow-[var(--shadow-soft)]'
                    : 'border-[color:var(--line)] bg-[color:var(--surface)] hover:-translate-y-0.5 hover:border-[color:var(--line-strong)]',
                  !checked && atMax ? 'pointer-events-none opacity-45' : '',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTicker(fund.ticker)}
                  disabled={isLoadingFunds || isCalculating || (!checked && atMax)}
                  className="sr-only"
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className="mt-1 h-3 w-3 rounded-full"
                    style={{ backgroundColor: getFundColor(colorIndex) }}
                    aria-hidden="true"
                  />
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[0.72rem] font-semibold ${
                      checked
                        ? 'border-[color:var(--signal)] bg-[color:var(--surface-muted)] text-[color:var(--signal)]'
                        : 'border-[color:var(--line)] text-[color:var(--text-muted)]'
                    }`}
                  >
                    {checked ? 'Selected' : formatPercent(fund.expectedAnnualReturn)}
                  </span>
                </div>

                <div className="mt-5">
                  <span className="block text-lg font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
                    {fund.ticker}
                  </span>
                  <span className="mt-2 block text-sm leading-6 text-[color:var(--text-secondary)]">
                    {fund.name}
                  </span>
                </div>

                <div className="mt-auto pt-5 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
                  {fundTab === 'mf' ? 'Mutual fund' : 'Benchmark / ETF'}
                </div>
              </label>
            )
          })}
        </div>

        {customTickers.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {customTickers.map((ticker) => (
              <span key={ticker} className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[color:var(--text-primary)]">
                {ticker}
                <button
                  type="button"
                  className="border-none bg-transparent p-0 text-[color:var(--text-muted)] transition hover:text-[color:var(--error)]"
                  onClick={() => onRemoveCustomTicker(ticker)}
                  aria-label={`Remove ${ticker}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {!showCustom ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 border-none bg-transparent p-0 text-sm font-semibold text-[color:var(--signal)] transition hover:opacity-80"
            onClick={() => setShowCustom(true)}
          >
            <span className="text-lg leading-none">+</span>
            Add a custom ticker
          </button>
        ) : (
          <div className="mt-4 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                className="northline-input flex-1"
                value={customInput}
                onChange={(event) => setCustomInput(event.target.value.toUpperCase().replace(/[^A-Z]/g, ''))}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    tryAddCustom(customInput)
                  }
                  if (event.key === 'Escape') {
                    setShowCustom(false)
                    setCustomInput('')
                    setDuplicateWarning('')
                  }
                }}
                placeholder="Ticker symbol, for example VTSAX"
                disabled={isCalculating || atMax}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="northline-button-primary"
                  disabled={customInput.length < 1 || customInput.length > 5 || atMax}
                  onClick={() => tryAddCustom(customInput)}
                >
                  Add ticker
                </button>
                <button
                  type="button"
                  className="northline-button-secondary"
                  onClick={() => {
                    setShowCustom(false)
                    setCustomInput('')
                    setDuplicateWarning('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
            {duplicateWarning && <p className="mt-3 text-sm text-[color:var(--warning)]">{duplicateWarning}</p>}
          </div>
        )}

        {errors.tickers && <p className="mt-4 text-sm text-[color:var(--error)]">{errors.tickers}</p>}
      </section>

      <section className="northline-card rounded-[28px] p-5 sm:p-6">
        <SectionHeading
          eyebrow="Set your money plan"
          title="Capture the dollars you expect to commit."
          description="Use your current starting balance, any monthly contribution, and an optional target so the model reflects the plan you are actually considering."
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <InputField label="Initial investment" error={errors.investment}>
            <input
              id="investment"
              name="investment"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.investment}
              onChange={onChange}
              placeholder="10000"
              disabled={isCalculating}
              className="northline-input"
            />
          </InputField>

          <InputField label="Monthly contribution" optional>
            <input
              id="monthlyContribution"
              name="monthlyContribution"
              type="number"
              inputMode="decimal"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={onMonthlyChange}
              placeholder="500"
              disabled={isCalculating}
              className="northline-input"
            />
          </InputField>

          <InputField label="Goal amount" optional>
            <input
              id="goalAmount"
              name="goalAmount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={goalAmount}
              onChange={onGoalChange}
              placeholder="50000"
              disabled={isCalculating}
              className="northline-input"
            />
          </InputField>
        </div>
      </section>

      <section className="northline-card rounded-[28px] p-5 sm:p-6">
        <SectionHeading
          eyebrow="Set time horizon and risk"
          title="Match the plan to your patience and comfort level."
          description="A longer timeline and a higher comfort with volatility can produce very different outcomes. Move both sliders until the scenario feels realistic."
        />

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="years" className="text-sm font-semibold text-[color:var(--text-primary)]">
                Investment duration
              </label>
              <span className="northline-chip">
                {form.years || 10} years
              </span>
            </div>
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
              className="northline-range mt-5"
            />
            <div className="mt-3 flex justify-between text-xs text-[color:var(--text-muted)]">
              <span>1 year</span>
              <span>50 years</span>
            </div>
            {errors.years && <p className="mt-3 text-sm text-[color:var(--error)]">{errors.years}</p>}
          </div>

          <div className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="riskTolerance" className="text-sm font-semibold text-[color:var(--text-primary)]">
                Risk comfort
              </label>
              <span className="northline-chip">
                {riskTolerance}/10 · {getRiskLabel(riskTolerance)}
              </span>
            </div>
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
              className="northline-range mt-5"
            />
            <div className="mt-3 flex justify-between text-xs text-[color:var(--text-muted)]">
              <span>Steadier</span>
              <span>Growth-seeking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="northline-card rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-[48ch]">
            <p className="northline-eyebrow mb-2">Methodology note</p>
            <p className="text-sm leading-6 text-[color:var(--text-secondary)]">
              Northline uses CAPM-based expected returns, live fund data, and the exact same assumptions across each fund so the comparison stays apples-to-apples.
            </p>
          </div>
          <button
            type="submit"
            className="northline-button-primary justify-center"
            disabled={isCalculating || isLoadingFunds || funds.length === 0}
          >
            {isCalculating ? 'Building comparison…' : 'Build comparison'}
          </button>
        </div>
      </section>
    </form>
  )
}

export default CalculatorForm
