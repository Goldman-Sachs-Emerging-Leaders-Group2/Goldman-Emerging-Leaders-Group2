import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const PieBreakdown = ({ result, isMulti }) => {
  const [activeIndex, setActiveIndex] = useState(null)

  if (!result) return null

  const invested = result.initialInvestment
  const change = result.futureValue - invested
  const isLoss = change < 0
  const years = result.years

  const gainPercent = (invested > 0 && result.futureValue > 0) ? Math.round((Math.max(0, change) / result.futureValue) * 100) : 0
  const investedPercent = 100 - gainPercent

  const multiplier = invested > 0 ? (change / invested) : 0

  const data = isLoss
    ? [
        { name: 'Remaining Value', value: result.futureValue },
        { name: 'Loss', value: Math.abs(change) },
      ]
    : [
        { name: 'Your Investment', value: invested },
        { name: 'Market Growth', value: change },
      ]

  const COLORS = isLoss
    ? ['var(--navy, #00244D)', '#E87040']
    : ['var(--navy, #00244D)', 'var(--accent, #B5985A)']

  const takeaway = isLoss
    ? `Your investment loses ${formatCurrency(Math.abs(multiplier))} for every $1 invested`
    : `For every $1 you invest, the market adds ${formatCurrency(multiplier)}`

  // Center label content — changes on hover
  const hoveredData = activeIndex !== null ? data[activeIndex] : null
  const divisor = isLoss ? invested : result.futureValue
  const hoveredPercent = activeIndex !== null && divisor > 0
    ? Math.round((data[activeIndex].value / divisor) * 100)
    : null

  return (
    <div className="pie-breakdown">
      {isMulti && (
        <div className="pie-fund-label">
          <span className="pie-fund-badge">Top Performer</span>
          <span className="pie-fund-name">{result.fundName}</span>
        </div>
      )}
      <div className="pie-chart-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationBegin={200}
              animationDuration={800}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-center-label">
          {hoveredData ? (
            <>
              <span className="pie-center-amount">{formatCurrency(hoveredData.value)}</span>
              <span className="pie-center-sub">{hoveredData.name}</span>
              <span className="pie-center-split">{hoveredPercent}% of total</span>
            </>
          ) : (
            <>
              <span className="pie-center-amount">{formatCurrency(result.futureValue)}</span>
              <span className="pie-center-sub">After {years} years</span>
              {!isLoss && (
                <span className="pie-center-split">{investedPercent}% yours · {gainPercent}% growth</span>
              )}
            </>
          )}
        </div>
      </div>
      <div className="pie-legend">
        <div className="pie-legend-item">
          <span className="pie-legend-dot" style={{ background: '#00244D' }} />
          <span className="pie-legend-label">{isLoss ? 'Remaining' : 'Invested'}</span>
          <span className="pie-legend-value">{formatCurrency(isLoss ? result.futureValue : invested)}</span>
        </div>
        <div className="pie-legend-item">
          <span className="pie-legend-dot" style={{ background: isLoss ? '#E87040' : '#B5985A' }} />
          <span className={`pie-legend-label${isLoss ? ' pie-legend-label--loss' : ''}`}>
            {isLoss ? 'Loss' : 'Growth'}
          </span>
          <span className={`pie-legend-value${isLoss ? ' pie-legend-value--loss' : ''}`}>
            {isLoss ? `-${formatCurrency(Math.abs(change))}` : formatCurrency(change)}
          </span>
        </div>
      </div>
      <p className="pie-takeaway">{takeaway}</p>
    </div>
  )
}

export default PieBreakdown
