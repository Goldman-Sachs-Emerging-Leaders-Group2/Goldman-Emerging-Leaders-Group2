import {
  formatCurrency,
  formatDecimal,
  formatPercent,
} from '../utils/formatters'
import { useCountUp } from '../hooks/useCountUp'
import ComparisonTable from './ComparisonTable'

const HELP_TEXT = {
  capm: 'The expected annual return estimated by the Capital Asset Pricing Model.',
  market: 'The historical market return being used as the comparison baseline.',
  riskFree: 'The Treasury-style baseline used to represent a risk-free return.',
  beta: 'How sensitive this fund is to market swings compared with the S&P 500.',
}

const HelpIcon = ({ text }) => (
  <span
    className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[color:var(--line)] text-[0.7rem] font-semibold text-[color:var(--text-muted)]"
    title={text}
  >
    ?
  </span>
)

const BreakdownRow = ({ label, helpText, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3">
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span className="text-sm font-medium text-[color:var(--text-secondary)]">{label}</span>
      <HelpIcon text={helpText} />
    </div>
    <div className="text-sm font-semibold text-[color:var(--text-primary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {children}
    </div>
  </div>
)

const ResultMetric = ({ label, value }) => (
  <div className="rounded-[22px] border border-white/10 bg-white/6 px-4 py-3">
    <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--hero-muted)]">
      {label}
    </span>
    <span className="mt-2 block text-lg font-semibold text-[color:var(--hero-text)]">
      {value}
    </span>
  </div>
)

const SingleResult = ({ result }) => {
  const animatedValue = useCountUp(result.futureValue)
  const totalContributed = result.totalContributed || result.initialInvestment
  const netGrowth = result.futureValue - totalContributed
  const riskLevel = result.beta < 0.8 ? 'Conservative' : result.beta <= 1.2 ? 'Moderate' : 'Aggressive'
  const riskWidth = Math.min((result.beta / 2) * 100, 100)

  return (
    <div className="grid gap-5 transition-opacity duration-300" aria-live="polite">
      <div className="rounded-[28px] border border-[color:var(--hero-border)] bg-[image:var(--hero-bg)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--hero-muted)]">
              Lead projection
            </p>
            <h3 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[color:var(--hero-text)]">
              {result.fundName || 'Unknown Fund'}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--hero-muted)]">
              {result.ticker || 'Saved scenario'} · {result.years} year plan
            </p>
          </div>

          <div className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-[color:var(--hero-text)]">
            {formatCurrency(animatedValue)}
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <ResultMetric label="Projected value" value={formatCurrency(animatedValue)} />
          <ResultMetric label="Total contributed" value={formatCurrency(totalContributed)} />
          <ResultMetric label="Net growth" value={formatCurrency(netGrowth)} />
        </div>
      </div>

      <div className="grid gap-3">
        <BreakdownRow label="Expected return (CAPM)" helpText={HELP_TEXT.capm}>
          {formatPercent(result.capmReturn)}
        </BreakdownRow>
        <BreakdownRow label="Observed market return" helpText={HELP_TEXT.market}>
          {formatPercent(result.expectedMarketReturn)}
        </BreakdownRow>
        <BreakdownRow label="Treasury baseline" helpText={HELP_TEXT.riskFree}>
          {formatPercent(result.riskFreeRate)}
        </BreakdownRow>
        <BreakdownRow label="Volatility vs. S&P 500" helpText={HELP_TEXT.beta}>
          <span className="inline-flex items-center gap-3">
            <span className="h-2 w-16 overflow-hidden rounded-full bg-[color:var(--line)]">
              <span className="block h-full rounded-full bg-[color:var(--signal)]" style={{ width: `${riskWidth}%` }} />
            </span>
            <span>{formatDecimal(result.beta, 2)} · {riskLevel}</span>
          </span>
        </BreakdownRow>
      </div>
    </div>
  )
}

const ResultPanel = ({ results, isCalculating, riskTolerance }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const isMulti = tickers.length > 1

  if (!hasResults) {
    return (
      <div className="northline-empty-state">
        {isCalculating
          ? 'Building comparison details…'
          : 'Build a comparison to review projected values, CAPM metrics, and risk signals.'}
      </div>
    )
  }

  return (
    <div
      className={`grid gap-3.5 transition-opacity duration-300 ${isCalculating ? 'opacity-50' : ''}`}
      aria-live="polite"
      data-testid="result-content"
    >
      {isMulti ? (
        <ComparisonTable results={results} riskTolerance={riskTolerance} />
      ) : (
        <SingleResult result={results[tickers[0]]} />
      )}
    </div>
  )
}

export default ResultPanel
