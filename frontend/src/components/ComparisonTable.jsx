import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'
import { isRiskMatch, isTooConservative } from '../utils/riskMatch'

const ComparisonTable = ({ results, riskTolerance }) => {
  const tickers = Object.keys(results)

  const bestFV = tickers.reduce((best, t) => results[t].futureValue > results[best].futureValue ? t : best, tickers[0])
  const lowestBeta = tickers.reduce((best, t) => results[t].beta < results[best].beta ? t : best, tickers[0])

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Fund</th>
            <th>Beta</th>
            <th>CAPM Return</th>
            <th>Market Return</th>
            <th>Future Value</th>
            <th></th>
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
              <tr key={ticker}>
                <td>
                  <span className="comparison-fund-cell">
                    <span className="comparison-fund-dot" style={{ backgroundColor: getFundColor(i) }} />
                    <span>
                      <span className="comparison-fund-ticker">{ticker}</span>
                      <span className="comparison-fund-name">{r.fundName}</span>
                    </span>
                  </span>
                </td>
                <td className={isSafest ? 'comparison-best' : ''}>{formatDecimal(r.beta, 2)}</td>
                <td>{formatPercent(r.capmReturn)}</td>
                <td>{formatPercent(r.expectedMarketReturn)}</td>
                <td className={isBestGrowth ? 'comparison-best' : ''}>{formatCurrency(r.futureValue)}</td>
                <td>
                  {isBestGrowth && isSafest && <span className="verdict-tag verdict-tag--best">Best Overall</span>}
                  {isBestGrowth && !isSafest && <span className="verdict-tag verdict-tag--growth">Best Growth</span>}
                  {isSafest && !isBestGrowth && <span className="verdict-tag verdict-tag--safe">Safest</span>}
                  {!riskOk && <span className="verdict-tag verdict-tag--caution">High Risk</span>}
                  {tooSafe && <span className="verdict-tag verdict-tag--neutral">Conservative</span>}
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
