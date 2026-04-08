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
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 text-sm shadow-[var(--shadow-soft)]">
      <p className="font-semibold text-[color:var(--text-primary)]">Year {label}</p>
      <div className="mt-2 grid gap-2">
        {payload.map((entry) => {
          if (isSingle) {
            const gain = entry.value - initialInvestment
            return (
              <p key={entry.dataKey} className="text-xs font-medium" style={{ color: entry.color }}>
                {formatCurrency(entry.value)} {gain >= 0 ? `(+${formatCurrency(gain)})` : `(${formatCurrency(gain)})`}
              </p>
            )
          }

          return (
            <p key={entry.dataKey} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          )
        })}
      </div>
    </div>
  )
}

const GrowthChart = ({ results, isCalculating, goalAmount }) => {
  const tickers = Object.keys(results)
  const hasResults = tickers.length > 0
  const isMulti = tickers.length > 1

  if (!hasResults) {
    return (
      <div className="northline-empty-state">
        {isCalculating ? 'Building growth path…' : 'Build a comparison to see how each scenario compounds over time.'}
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

  return (
    <div
      data-testid="chart-container"
      className={`transition-opacity duration-300 ${isCalculating ? 'opacity-50' : ''}`}
      aria-label="Projected investment growth chart"
    >
      <ResponsiveContainer width="100%" height={340}>
        <AreaChart data={data} margin={{ top: 10, right: 18, left: 4, bottom: 8 }}>
          <defs>
            {dataKeys.map((key, index) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getFundColor(index)} stopOpacity={0.28} />
                <stop offset="100%" stopColor={getFundColor(index)} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxisTick}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            content={<EnhancedTooltip initialInvestment={initialInvestment} isSingle={!isMulti} />}
            cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '4 6' }}
          />
          {isMulti && (
            <Legend
              wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12, paddingTop: 10 }}
            />
          )}
          <Area
            type="monotone"
            dataKey="contributed"
            stroke="var(--text-muted)"
            strokeWidth={1.5}
            strokeDasharray="6 4"
            fill="none"
            dot={false}
            activeDot={false}
            name="Contributed"
            animationDuration={900}
          />
          {goalValue > 0 && (
            <ReferenceLine
              y={goalValue}
              stroke="var(--accent)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{ value: `Goal ${formatYAxisTick(goalValue)}`, position: 'right', fill: 'var(--accent)', fontSize: 11 }}
            />
          )}
          {dataKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={getFundColor(index)}
              strokeWidth={2.2}
              fill={`url(#gradient-${key})`}
              dot={false}
              activeDot={{ r: 5, fill: getFundColor(index), stroke: 'var(--surface-strong)', strokeWidth: 2 }}
              animationDuration={900}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GrowthChart
