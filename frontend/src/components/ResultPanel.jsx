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
  <span className="help-icon" title={text}>?</span>
)

const SingleResult = ({ result }) => {
  const animatedValue = useCountUp(result.futureValue)

  return (
    <div className="result-content" aria-live="polite">
      <p className="result-fund-name">{result.fundName || 'Unknown Fund'}</p>

      <div className="result-hero-card">
        <span className="result-hero-label">Future Value</span>
        <div className="result-hero-value">{formatCurrency(animatedValue)}</div>
        <p className="result-hero-context">
          {formatCurrency(result.initialInvestment)} invested over {result.years ?? '—'} years
        </p>
      </div>

      <div className="result-breakdown">
        <div className="breakdown-row">
          <div className="breakdown-label-group">
            <div className="breakdown-dot blue" />
            <span className="breakdown-label">CAPM Return</span>
            <HelpIcon text={HELP_TEXT.capm} />
          </div>
          <span className="breakdown-value">{formatPercent(result.capmReturn)}</span>
        </div>

        <div className="breakdown-row">
          <div className="breakdown-label-group">
            <div className="breakdown-dot green" />
            <span className="breakdown-label">Expected Market Return</span>
            <HelpIcon text={HELP_TEXT.market} />
          </div>
          <span className="breakdown-value">{formatPercent(result.expectedMarketReturn)}</span>
        </div>

        <div className="breakdown-row">
          <div className="breakdown-label-group">
            <div className="breakdown-dot amber" />
            <span className="breakdown-label">Risk-Free Rate</span>
            <HelpIcon text={HELP_TEXT.riskFree} />
          </div>
          <span className="breakdown-value">{formatPercent(result.riskFreeRate)}</span>
        </div>

        <div className="breakdown-row">
          <div className="breakdown-label-group">
            <div className="breakdown-dot purple" />
            <span className="breakdown-label">Beta</span>
            <HelpIcon text={HELP_TEXT.beta} />
          </div>
          <div className="risk-meter-group">
            <div className="risk-meter">
              <div
                className={`risk-meter__fill ${result.beta < 0.8 ? 'risk-low' : result.beta <= 1.2 ? 'risk-moderate' : 'risk-high'}`}
                style={{ width: `${Math.min((result.beta / 2) * 100, 100)}%` }}
              />
            </div>
            <span className="breakdown-value">
              {formatDecimal(result.beta, 2)} · {result.beta < 0.8 ? 'Conservative' : result.beta <= 1.2 ? 'Moderate' : 'Aggressive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ResultPanel = ({ results, isCalculating }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const isMulti = tickers.length > 1

  if (!hasResults) {
    return (
      <div className="empty-state">
        <p>
          {isCalculating
            ? 'Calculating projected outcomes…'
            : 'Run a calculation to view projected outcomes and CAPM metrics.'}
        </p>
      </div>
    )
  }

  return (
    <div className={isCalculating ? 'result-content updating' : 'result-content'} aria-live="polite">
      {isMulti ? (
        <ComparisonTable results={results} />
      ) : (
        <SingleResult result={results[tickers[0]]} />
      )}
    </div>
  )
}

export default ResultPanel
