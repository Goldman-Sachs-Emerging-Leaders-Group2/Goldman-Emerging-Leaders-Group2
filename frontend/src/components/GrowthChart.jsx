import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { generateProjectionData, generateMultiProjectionData } from '../utils/projection'
import { formatCurrency } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const formatYAxisTick = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const MultiTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">Year {label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="chart-tooltip-value" style={{ color: entry.color }}>
          {entry.dataKey}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  )
}

const GrowthChart = ({ results, isCalculating }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const isMulti = tickers.length > 1

  if (!hasResults) {
    return (
      <div className="empty-state">
        <p>
          {isCalculating
            ? 'Calculating projection…'
            : 'Run a calculation to see projected growth.'}
        </p>
      </div>
    )
  }

  const data = isMulti
    ? generateMultiProjectionData(results)
    : generateProjectionData(results[tickers[0]])

  const dataKeys = isMulti ? tickers : ['value']

  return (
    <div
      className={`chart-container${isCalculating ? ' updating' : ''}`}
      aria-label="Projected investment growth chart"
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getFundColor(i)} stopOpacity={0.15} />
                <stop offset="100%" stopColor={getFundColor(i)} stopOpacity={0.01} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="#1a2d3f" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#7a96b2', fontSize: 12 }}
            axisLine={{ stroke: '#1a2d3f' }}
            tickLine={{ stroke: '#1a2d3f' }}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5, fill: '#7a96b2', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{ fill: '#7a96b2', fontSize: 12 }}
            axisLine={{ stroke: '#1a2d3f' }}
            tickLine={{ stroke: '#1a2d3f' }}
            width={65}
          />
          <Tooltip content={<MultiTooltip />} />
          {isMulti && (
            <Legend
              wrapperStyle={{ color: '#7a96b2', fontSize: 12, paddingTop: 8 }}
            />
          )}
          {dataKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getFundColor(i)}
              strokeWidth={2}
              fill={`url(#gradient-${key})`}
              dot={false}
              activeDot={{ r: 4, fill: getFundColor(i), stroke: '#0f1c2b', strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GrowthChart
