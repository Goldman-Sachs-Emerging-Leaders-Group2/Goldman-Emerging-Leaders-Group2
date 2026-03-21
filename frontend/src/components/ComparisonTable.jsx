import { formatCurrency, formatDecimal, formatPercent } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const METRICS = [
  { key: 'fundName', label: 'Fund Name', format: (v) => v },
  { key: 'beta', label: 'Beta', format: (v) => formatDecimal(v, 2), best: 'min' },
  { key: 'capmReturn', label: 'CAPM Return', format: (v) => formatPercent(v), best: 'max' },
  { key: 'expectedMarketReturn', label: 'Market Return', format: (v) => formatPercent(v) },
  { key: 'futureValue', label: 'Future Value', format: (v) => formatCurrency(v), best: 'max' },
]

const ComparisonTable = ({ results }) => {
  const tickers = Object.keys(results)

  const getBestTicker = (key, direction) => {
    if (!direction) return null
    return tickers.reduce((best, ticker) => {
      const val = results[ticker][key]
      const bestVal = results[best][key]
      return direction === 'max' ? (val > bestVal ? ticker : best) : (val < bestVal ? ticker : best)
    }, tickers[0])
  }

  return (
    <div className="comparison-table-wrapper">
      <table className="comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            {tickers.map((ticker, i) => (
              <th key={ticker}>
                <span className="comparison-header-dot" style={{ backgroundColor: getFundColor(i) }} />
                {ticker}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {METRICS.map(({ key, label, format, best }) => {
            const bestTicker = getBestTicker(key, best)
            return (
              <tr key={key}>
                <td className="comparison-metric-label">{label}</td>
                {tickers.map((ticker) => (
                  <td
                    key={ticker}
                    className={bestTicker === ticker ? 'comparison-best' : ''}
                  >
                    {format(results[ticker][key])}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
