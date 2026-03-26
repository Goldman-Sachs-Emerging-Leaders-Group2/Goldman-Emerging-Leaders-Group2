import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'
import { isRiskMatch, isTooConservative } from '../utils/riskMatch'

const verdictStyles = {
  best:    'bg-[rgba(181,152,90,0.15)] text-[var(--accent)]',
  growth:  'bg-[rgba(5,150,105,0.1)] text-[var(--success)]',
  safe:    'bg-[rgba(46,107,158,0.1)] text-[#4A90C4]',
  caution: 'bg-[rgba(232,112,64,0.1)] text-[#E87040]',
  neutral: 'bg-[rgba(136,150,166,0.1)] text-[var(--text-muted)]',
}

const VerdictTag = ({ variant, children }) => (
  <span className={`inline-block text-[0.65rem] font-semibold px-1.5 py-[0.15rem] rounded uppercase tracking-[0.03em] ${verdictStyles[variant]}`}>
    {children}
  </span>
)

const ComparisonTable = ({ results, riskTolerance }) => {
  const tickers = Object.keys(results)

  const bestFV = tickers.reduce((best, t) => results[t].futureValue > results[best].futureValue ? t : best, tickers[0])
  const lowestBeta = tickers.reduce((best, t) => results[t].beta < results[best].beta ? t : best, tickers[0])

  const th = 'px-2 py-2 text-left text-[var(--text-muted)] font-semibold text-[0.65rem] uppercase tracking-[0.04em]'
  const td = 'px-2 py-2.5 text-left text-[var(--text-primary)] text-[0.8rem]'
  const bestCell = '!text-[var(--accent)] font-semibold'

  return (
    <table className="w-full border-collapse text-[0.8rem]">
      <thead>
        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
          <th className={th}>Fund</th>
          <th className={th}>Beta</th>
          <th className={th}>CAPM</th>
          <th className={th}>Mkt Ret</th>
          <th className={th}>Future Value</th>
          <th className={th}></th>
        </tr>
      </thead>
      <tbody>
        {tickers.map((ticker, i) => {
          const r = results[ticker]
          const isBestGrowth = ticker === bestFV
          const isSafest = ticker === lowestBeta
          const riskOk = riskTolerance == null || isRiskMatch(r.beta, riskTolerance)
          const tooSafe = riskTolerance != null && isTooConservative(r.beta, riskTolerance)
          return (
            <tr
              key={ticker}
              className="transition-colors duration-150 hover:bg-[rgba(181,152,90,0.04)]"
              style={{ borderBottom: '1px solid var(--card-border)' }}
            >
              <td className={td}>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: getFundColor(i) }} />
                  <span>
                    <span className="block font-bold text-[0.8rem]">{ticker}</span>
                    <span className="block text-[0.65rem] text-[var(--text-muted)] truncate max-w-[120px]">{r.fundName}</span>
                  </span>
                </span>
              </td>
              <td className={`${td} ${isSafest ? bestCell : ''}`}>{formatDecimal(r.beta, 2)}</td>
              <td className={td}>{formatPercent(r.capmReturn)}</td>
              <td className={td}>{formatPercent(r.expectedMarketReturn)}</td>
              <td className={`${td} ${isBestGrowth ? bestCell : ''} font-semibold`}>{formatCurrency(r.futureValue)}</td>
              <td className={td}>
                {isBestGrowth && isSafest && <VerdictTag variant="best">Best Overall</VerdictTag>}
                {isBestGrowth && !isSafest && <VerdictTag variant="growth">Best Growth</VerdictTag>}
                {isSafest && !isBestGrowth && <VerdictTag variant="safe">Safest</VerdictTag>}
                {!riskOk && <VerdictTag variant="caution">High Risk</VerdictTag>}
                {tooSafe && <VerdictTag variant="neutral">Conservative</VerdictTag>}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ComparisonTable
