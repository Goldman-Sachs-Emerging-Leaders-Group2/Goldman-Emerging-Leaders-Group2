import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const PieBreakdown = ({ result, isMulti }) => {
  const [activeIndex, setActiveIndex] = useState(null)

  if (!result) return null

  const invested = result.initialInvestment
  const monthly = result.monthlyContribution || 0
  const totalContributed = result.totalContributed || invested
  const totalMonthlyContribs = totalContributed - invested
  const change = result.futureValue - totalContributed
  const isLoss = change < 0
  const years = result.years
  const hasSIP = monthly > 0

  const multiplier = totalContributed > 0 ? (change / totalContributed) : 0

  let data, COLORS
  if (isLoss) {
    data = [
      { name: 'Remaining Value', value: result.futureValue },
      { name: 'Loss', value: Math.abs(change) },
    ]
    COLORS = ['var(--navy, #00244D)', '#E87040']
  } else if (hasSIP) {
    data = [
      { name: 'Initial Investment', value: invested },
      { name: 'Monthly Contributions', value: totalMonthlyContribs },
      { name: 'Market Growth', value: change },
    ]
    COLORS = ['var(--navy, #00244D)', '#0EA5A1', 'var(--accent, #B5985A)']
  } else {
    data = [
      { name: 'Your Investment', value: invested },
      { name: 'Market Growth', value: change },
    ]
    COLORS = ['var(--navy, #00244D)', 'var(--accent, #B5985A)']
  }

  const growthPercent = (result.futureValue > 0 && totalContributed > 0)
    ? Math.round((Math.max(0, change) / result.futureValue) * 100)
    : 0

  const takeaway = isLoss
    ? `Your investment loses ${formatCurrency(Math.abs(multiplier))} for every $1 invested`
    : hasSIP
      ? `You contribute ${formatCurrency(totalContributed)} total. The market adds ${formatCurrency(change)} on top.`
      : `For every $1 you invest, the market adds ${formatCurrency(multiplier)}`

  const divisor = isLoss ? totalContributed : result.futureValue
  const hoveredData = activeIndex !== null ? data[activeIndex] : null
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
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
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
              <span className="pie-center-sub">{hoveredData.name}{hoveredPercent !== null ? ` · ${hoveredPercent}%` : ''}</span>
            </>
          ) : (
            <>
              <span className="pie-center-amount">{formatCurrency(result.futureValue)}</span>
              <span className="pie-center-sub">After {years} years</span>
            </>
          )}
        </div>
      </div>
      <div className="pie-legend">
        {data.map((segment, i) => (
          <div className="pie-legend-item" key={segment.name}>
            <span className="pie-legend-dot" style={{ background: COLORS[i]?.replace('var(--navy, ', '').replace('var(--accent, ', '').replace(')', '') || COLORS[i] }} />
            <span className={`pie-legend-label${isLoss && segment.name === 'Loss' ? ' pie-legend-label--loss' : ''}`}>
              {segment.name}
            </span>
            <span className={`pie-legend-value${isLoss && segment.name === 'Loss' ? ' pie-legend-value--loss' : ''}`}>
              {segment.name === 'Loss' ? `-${formatCurrency(segment.value)}` : formatCurrency(segment.value)}
            </span>
          </div>
        ))}
      </div>
      <p className="pie-takeaway">{takeaway}</p>
    </div>
  )
}

export default PieBreakdown
