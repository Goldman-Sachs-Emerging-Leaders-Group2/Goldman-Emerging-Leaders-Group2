import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'
import { isRiskMatch, isTooConservative } from '../utils/riskMatch'

const verdictStyles = {
  best: 'bg-[color:var(--signal)]/12 text-[color:var(--signal)]',
  growth: 'bg-[color:var(--success)]/12 text-[color:var(--success)]',
  safe: 'bg-[color:var(--navy)]/10 text-[color:var(--navy)]',
  caution: 'bg-[color:var(--warning)]/12 text-[color:var(--warning)]',
  neutral: 'bg-[color:var(--surface-muted)] text-[color:var(--text-muted)]',
}

const VerdictTag = ({ variant, children }) => (
  <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.72rem] font-semibold ${verdictStyles[variant]}`}>
    {children}
  </span>
)

const tableHeadClass = 'px-3 py-3 text-left text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]'
const tableCellClass = 'px-3 py-4 text-sm text-[color:var(--text-primary)]'

const ComparisonTable = ({ results, riskTolerance }) => {
  const tickers = Object.keys(results)

  const bestFutureValueTicker = tickers.reduce((best, ticker) => (
    results[ticker].futureValue > results[best].futureValue ? ticker : best
  ), tickers[0])
  const lowestBetaTicker = tickers.reduce((best, ticker) => (
    results[ticker].beta < results[best].beta ? ticker : best
  ), tickers[0])

  return (
    <div className="northline-table-scroll overflow-x-auto" data-testid="comparison-table-scroll">
      <table className="min-w-[720px] w-full border-separate border-spacing-0" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <thead>
          <tr>
            <th className={tableHeadClass}>Fund</th>
            <th className={`${tableHeadClass} text-right`}>Beta</th>
            <th className={`${tableHeadClass} text-right`}>CAPM</th>
            <th className={`${tableHeadClass} text-right`}>Market return</th>
            <th className={`${tableHeadClass} text-right`}>Projected value</th>
            <th className={tableHeadClass}>Assessment</th>
          </tr>
        </thead>
        <tbody>
          {tickers.map((ticker, index) => {
            const result = results[ticker]
            const isLeader = ticker === bestFutureValueTicker
            const isSafest = ticker === lowestBetaTicker
            const riskMatch = riskTolerance == null || isRiskMatch(result.beta, riskTolerance)
            const tooConservative = riskTolerance != null && isTooConservative(result.beta, riskTolerance)

            return (
              <tr key={ticker} className="rounded-2xl">
                <td className={`${tableCellClass} border-t border-[color:var(--line)]`}>
                  <span className="flex items-center gap-3">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: getFundColor(index) }} aria-hidden="true" />
                    <span>
                      <span className="block font-semibold text-[color:var(--text-primary)]">{ticker}</span>
                      <span className="block text-xs text-[color:var(--text-muted)]">{result.fundName}</span>
                    </span>
                  </span>
                </td>
                <td className={`${tableCellClass} border-t border-[color:var(--line)] text-right ${isSafest ? 'font-semibold text-[color:var(--signal)]' : ''}`}>
                  {formatDecimal(result.beta, 2)}
                </td>
                <td className={`${tableCellClass} border-t border-[color:var(--line)] text-right`}>
                  {formatPercent(result.capmReturn)}
                </td>
                <td className={`${tableCellClass} border-t border-[color:var(--line)] text-right`}>
                  {formatPercent(result.expectedMarketReturn)}
                </td>
                <td className={`${tableCellClass} border-t border-[color:var(--line)] text-right ${isLeader ? 'font-semibold text-[color:var(--signal)]' : ''}`}>
                  {formatCurrency(result.futureValue)}
                </td>
                <td className={`${tableCellClass} border-t border-[color:var(--line)]`}>
                  <div className="flex flex-wrap gap-2">
                    {isLeader && <VerdictTag variant="growth">Top projection</VerdictTag>}
                    {isSafest && <VerdictTag variant="safe">Lowest beta</VerdictTag>}
                    {!riskMatch && <VerdictTag variant="caution">Risk above target</VerdictTag>}
                    {tooConservative && <VerdictTag variant="neutral">More cautious</VerdictTag>}
                    {!isLeader && !isSafest && riskMatch && !tooConservative && (
                      <VerdictTag variant="best">Balanced fit</VerdictTag>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
