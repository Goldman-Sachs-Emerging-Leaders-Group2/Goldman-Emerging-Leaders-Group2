import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const SHORT_NAMES = {
  'Initial Investment': 'Initial',
  'Your Investment': 'Invested',
  'Monthly Contributions': 'Monthly',
  'Market Growth': 'Growth',
  'Remaining Value': 'Remaining',
  'Loss': 'Loss',
}

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

  const divisor = isLoss ? totalContributed : result.futureValue
  const hoveredData = activeIndex !== null ? data[activeIndex] : null
  const hoveredPercent = activeIndex !== null && divisor > 0
    ? Math.round((data[activeIndex].value / divisor) * 100)
    : null

  const takeaway = isLoss
    ? `Your investment loses ${formatCurrency(Math.abs(multiplier))} for every $1 invested`
    : hasSIP
      ? `You contribute ${formatCurrency(totalContributed)} total. The market adds ${formatCurrency(change)} on top.`
      : `For every $1 you invest, the market adds ${formatCurrency(multiplier)}`

  return (
    <div className="flex flex-col items-center gap-3">
      {isMulti && (
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-gold/15 text-gold border border-gold/25">
            Top Performer
          </span>
          <span style={{ color: 'var(--text-primary)' }} className="font-medium">{result.fundName}</span>
        </div>
      )}

      <div className="relative w-full">
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
                <Cell
                  key={i}
                  fill={COLORS[i]}
                  opacity={activeIndex === null ? 1 : activeIndex === i ? 1 : 0.4}
                  stroke={activeIndex === i ? COLORS[i] : 'none'}
                  strokeWidth={activeIndex === i ? 3 : 0}
                  style={{
                    filter: activeIndex === i ? 'brightness(1.2) drop-shadow(0 0 6px rgba(181,152,90,0.4))' : 'none',
                    transition: 'opacity 0.2s ease, filter 0.2s ease',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none max-w-[110px] mx-auto">
          {hoveredData ? (
            <>
              <span className="text-lg font-bold text-center" style={{ color: 'var(--text-primary)' }}>{formatCurrency(hoveredData.value)}</span>
              <span className="text-[0.65rem] text-center" style={{ color: 'var(--text-muted)' }}>{SHORT_NAMES[hoveredData.name] || hoveredData.name}{hoveredPercent !== null ? ` · ${hoveredPercent}%` : ''}</span>
            </>
          ) : (
            <>
              <span className="text-lg font-bold text-center" style={{ color: 'var(--text-primary)' }}>{formatCurrency(result.futureValue)}</span>
              <span className="text-[0.65rem] text-center" style={{ color: 'var(--text-muted)' }}>After {years} years</span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 max-[480px]:flex-col max-[480px]:gap-2">
        {data.map((segment, i) => {
          const dotColor = COLORS[i]?.replace('var(--navy, ', '').replace('var(--accent, ', '').replace(')', '') || COLORS[i]
          const isLossSegment = isLoss && segment.name === 'Loss'
          return (
            <div
              className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-all duration-200 cursor-pointer ${activeIndex === i ? 'bg-[rgba(181,152,90,0.08)] scale-[1.02]' : ''}`}
              key={segment.name}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="w-2 h-2 rounded-full shrink-0 transition-transform duration-200" style={{ background: dotColor, transform: activeIndex === i ? 'scale(1.4)' : 'scale(1)' }} />
              <span className={isLossSegment ? 'text-orange-500' : ''} style={!isLossSegment ? { color: 'var(--text-secondary)' } : undefined}>
                {segment.name}
              </span>
              <span className={`font-semibold ${isLossSegment ? 'text-orange-500' : ''}`} style={!isLossSegment ? { color: 'var(--text-primary)' } : undefined}>
                {segment.name === 'Loss' ? `-${formatCurrency(segment.value)}` : formatCurrency(segment.value)}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>{takeaway}</p>
    </div>
  )
}

export default PieBreakdown
