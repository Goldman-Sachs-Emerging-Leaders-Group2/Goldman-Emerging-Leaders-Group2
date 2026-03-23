import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import { generateProjectionData, generateMultiProjectionData } from '../utils/projection'
import { formatCurrency } from '../utils/formatters'
import { getFundColor } from '../utils/colors'

const formatYAxisTick = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const EnhancedTooltip = ({ active, payload, label, initialInvestment, isSingle }) => {
  if (!active || !payload?.length) return null

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">Year {label}</p>
      {payload.map((entry) => {
        if (isSingle) {
          const gain = entry.value - initialInvestment
          return (
            <p key={entry.dataKey} className="chart-tooltip-value" style={{ color: entry.color }}>
              {formatCurrency(entry.value)} {gain >= 0 ? `(+${formatCurrency(gain)})` : `(${formatCurrency(gain)})`}
            </p>
          )
        }
        return (
          <p key={entry.dataKey} className="chart-tooltip-value" style={{ color: entry.color }}>
            {entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        )
      })}
    </div>
  )
}

const GrowthChart = ({ results, isCalculating, goalAmount }) => {
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
  const goalValue = goalAmount ? Number(goalAmount) : null

  const firstResult = results[tickers[0]]
  const initialInvestment = firstResult?.initialInvestment ?? 0
  const doubleValue = initialInvestment * 2
  const maxProjected = isMulti
    ? Math.max(...Object.values(results).map(r => r.futureValue))
    : firstResult?.futureValue ?? 0
  const showDouble = doubleValue && maxProjected >= doubleValue

  return (
    <div
      className={`chart-container${isCalculating ? ' updating' : ''}`}
      aria-label="Projected investment growth chart"
    >
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <defs>
            {dataKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getFundColor(i)} stopOpacity={0.2} />
                <stop offset="100%" stopColor={getFundColor(i)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--card-border, #E5E7EB)" strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            tick={{ fill: 'var(--text-secondary, #4A5568)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--card-border, #E5E7EB)' }}
            tickLine={{ stroke: 'var(--card-border, #E5E7EB)' }}
            label={{ value: 'Year', position: 'insideBottomRight', offset: -5, fill: 'var(--text-secondary, #4A5568)', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{ fill: 'var(--text-secondary, #4A5568)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--card-border, #E5E7EB)' }}
            tickLine={{ stroke: 'var(--card-border, #E5E7EB)' }}
            width={65}
            label={{ value: 'Projected Value ($)', angle: -90, position: 'insideLeft', offset: 10, fill: 'var(--text-muted, #8896A6)', fontSize: 11 }}
          />
          <Tooltip
            content={<EnhancedTooltip initialInvestment={initialInvestment} isSingle={!isMulti} />}
            cursor={{ stroke: 'var(--text-muted, #8896A6)', strokeDasharray: '3 3' }}
          />
          {isMulti && (
            <Legend
              wrapperStyle={{ color: 'var(--text-secondary, #4A5568)', fontSize: 12, paddingTop: 8 }}
            />
          )}
          {/* Initial investment baseline */}
          <ReferenceLine
            y={initialInvestment}
            stroke="var(--text-muted, #8896A6)"
            strokeDasharray="8 4"
            strokeWidth={1}
            strokeOpacity={0.5}
            label={{ value: 'Initial', position: 'insideTopLeft', fill: 'var(--text-muted, #8896A6)', fontSize: 10 }}
          />
          {showDouble && (
            <ReferenceLine
              y={doubleValue}
              stroke="var(--text-muted, #8896A6)"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{ value: '2× investment', position: 'insideTopRight', fill: 'var(--text-muted, #8896A6)', fontSize: 11, dy: -8 }}
            />
          )}
          {goalValue > 0 && (
            <ReferenceLine
              y={goalValue}
              stroke="#B5985A"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{ value: `Goal: ${formatYAxisTick(goalValue)}`, position: 'right', fill: '#B5985A', fontSize: 12 }}
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
              activeDot={{ r: 6, fill: getFundColor(i), stroke: 'var(--card-bg, #fff)', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationBegin={300}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GrowthChart
