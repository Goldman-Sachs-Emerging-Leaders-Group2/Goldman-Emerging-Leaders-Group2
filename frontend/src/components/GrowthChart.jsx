import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceDot,
} from 'recharts'
import { generateProjectionData, generateMultiProjectionData } from '../utils/projection'
import { formatCurrency } from '../utils/formatters'
import { getAssetColor } from '../utils/colors'

const GOLD = '#D4A846'

const formatYAxisTick = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value}`
}

const EndpointLabel = ({ viewBox, value }) => {
  if (!viewBox) return null
  const { x, y } = viewBox
  return (
    <g>
      <rect x={x - 2} y={y - 24} width={70} height={22} rx={4} fill={GOLD} />
      <text x={x + 33} y={y - 10} textAnchor="middle" fill="#0b1520" fontSize={11} fontWeight={700} fontFamily="'JetBrains Mono', monospace">
        {formatYAxisTick(value)}
      </text>
    </g>
  )
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

const getChartColor = (index) => {
  if (index === 0) return GOLD
  return getAssetColor(index)
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
  const lastPoint = data[data.length - 1]
  const primaryKey = dataKeys[0]
  const endpointValue = lastPoint?.[primaryKey]

  return (
    <div
      className={`chart-container${isCalculating ? ' updating' : ''}`}
      aria-label="Projected investment growth chart"
    >
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
          <defs>
            {dataKeys.map((key, i) => {
              const color = getChartColor(i)
              return (
                <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                </linearGradient>
              )
            })}
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
          {dataKeys.map((key, i) => {
            const color = getChartColor(i)
            return (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${key})`}
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#0f1c2b', strokeWidth: 2 }}
              />
            )
          })}
          {endpointValue != null && lastPoint && (
            <ReferenceDot
              x={lastPoint.year}
              y={endpointValue}
              r={0}
              label={<EndpointLabel value={endpointValue} />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default GrowthChart
