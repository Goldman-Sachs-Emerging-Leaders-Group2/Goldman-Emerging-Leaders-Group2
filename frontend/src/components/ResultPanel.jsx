import {
  formatCurrency,
  formatDecimal,
  formatPercent,
} from '../utils/formatters'
import { useCountUp } from '../hooks/useCountUp'
import ComparisonTable from './ComparisonTable'

const HELP_TEXT = {
  capm: 'The expected annual return predicted by the Capital Asset Pricing Model',
  market: "The fund's historical average annual return",
  riskFree: 'The return on a risk-free investment (US Treasury rate)',
  beta: 'How volatile this fund is compared to the S&P 500. Beta > 1 means more volatile.',
}

const HelpIcon = ({ text }) => (
  <span
    className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[0.6rem] font-bold shrink-0 cursor-help transition-[background,color] duration-150 hover:text-[#00244D]"
    style={{
      background: 'var(--card-border)',
      color: 'var(--text-muted)',
    }}
    title={text}
  >
    ?
  </span>
)

const DOT_COLORS = {
  blue: '#4A90C4',
  green: 'var(--success)',
  amber: 'var(--accent)',
  purple: '#9B8ABF',
}

const RISK_FILL_COLORS = {
  low: 'var(--success)',
  moderate: 'var(--accent)',
  high: '#E87040',
}

const ANIMATION_DELAYS = ['1.1s', '1.2s', '1.3s', '1.4s']

const BreakdownRow = ({ color, label, helpText, children, index }) => (
  <div
    className="flex items-center justify-between px-3 py-2.5 rounded-lg border transition-[background] duration-150 animate-slide-in-left"
    style={{
      background: 'var(--bg)',
      borderColor: 'var(--card-border)',
      animationDelay: ANIMATION_DELAYS[index] || '0s',
      animationFillMode: 'both',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--card-border)' }}
  >
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: DOT_COLORS[color] }}
      />
      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <HelpIcon text={helpText} />
    </div>
    {children}
  </div>
)

const BreakdownValue = ({ children }) => (
  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
    {children}
  </span>
)

const SingleResult = ({ result }) => {
  const animatedValue = useCountUp(result.futureValue)

  const riskLevel = result.beta < 0.8 ? 'low' : result.beta <= 1.2 ? 'moderate' : 'high'
  const riskLabel = result.beta < 0.8 ? 'Conservative' : result.beta <= 1.2 ? 'Moderate' : 'Aggressive'

  return (
    <div className="grid gap-3.5 transition-opacity duration-300" aria-live="polite">
      <p className="text-sm font-medium m-0" style={{ color: 'var(--text-secondary)' }}>
        {result.fundName || 'Unknown Fund'}
      </p>

      <div
        className="rounded-[10px] px-6 py-5 border backdrop-blur-[8px]"
        style={{
          background: 'var(--hero-card-bg)',
          borderColor: 'var(--hero-card-border)',
        }}
      >
        <span
          className="text-xs font-semibold uppercase tracking-[0.06em]"
          style={{ color: 'var(--hero-card-muted)' }}
        >
          Future Value
        </span>
        <div
          className="text-[2.2rem] font-bold leading-[1.2] mt-1 mb-1.5"
          style={{ color: 'var(--hero-card-text)' }}
        >
          {formatCurrency(animatedValue)}
        </div>
        <p className="m-0 text-sm" style={{ color: 'var(--hero-card-muted)' }}>
          {formatCurrency(result.initialInvestment)} invested over {result.years ?? '\u2014'} years
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <BreakdownRow color="blue" label="CAPM Return" helpText={HELP_TEXT.capm} index={0}>
          <BreakdownValue>{formatPercent(result.capmReturn)}</BreakdownValue>
        </BreakdownRow>

        <BreakdownRow color="green" label="Expected Market Return" helpText={HELP_TEXT.market} index={1}>
          <BreakdownValue>{formatPercent(result.expectedMarketReturn)}</BreakdownValue>
        </BreakdownRow>

        <BreakdownRow color="amber" label="Risk-Free Rate" helpText={HELP_TEXT.riskFree} index={2}>
          <BreakdownValue>{formatPercent(result.riskFreeRate)}</BreakdownValue>
        </BreakdownRow>

        <BreakdownRow color="purple" label="Beta" helpText={HELP_TEXT.beta} index={3}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-[60px] h-1.5 rounded-full overflow-hidden shrink-0"
              style={{ background: 'var(--card-border)' }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.min((result.beta / 2) * 100, 100)}%`,
                  background: RISK_FILL_COLORS[riskLevel],
                  transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
            <BreakdownValue>
              {formatDecimal(result.beta, 2)} &middot; {riskLabel}
            </BreakdownValue>
          </div>
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
      <div
        className="border border-dashed rounded-lg py-8 px-6 text-sm text-center"
        style={{
          borderColor: 'var(--card-border)',
          color: 'var(--text-muted)',
        }}
      >
        <p>
          {isCalculating
            ? 'Calculating projected outcomes\u2026'
            : 'Run a calculation to view projected outcomes and CAPM metrics.'}
        </p>
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
