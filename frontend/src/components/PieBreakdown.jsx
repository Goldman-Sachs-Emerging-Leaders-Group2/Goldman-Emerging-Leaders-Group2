import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '../utils/formatters'

const SHORT_NAMES = {
  'Initial Investment': 'Starting amount',
  'Your Investment': 'Starting amount',
  'Monthly Contributions': 'Monthly adds',
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
  const hasMonthlyPlan = monthly > 0
  const growthMultiple = totalContributed > 0 ? result.futureValue / totalContributed : 0

  let data
  let colors

  if (isLoss) {
    data = [
      { name: 'Remaining Value', value: result.futureValue },
      { name: 'Loss', value: Math.abs(change) },
    ]
    colors = ['var(--navy)', 'var(--error)']
  } else if (hasMonthlyPlan) {
    data = [
      { name: 'Initial Investment', value: invested },
      { name: 'Monthly Contributions', value: totalMonthlyContribs },
      { name: 'Market Growth', value: change },
    ]
    colors = ['var(--navy)', 'var(--signal)', 'var(--accent)']
  } else {
    data = [
      { name: 'Your Investment', value: invested },
      { name: 'Market Growth', value: change },
    ]
    colors = ['var(--navy)', 'var(--accent)']
  }

  const divisor = isLoss ? totalContributed : result.futureValue
  const hoveredData = activeIndex !== null ? data[activeIndex] : null
  const hoveredPercent = activeIndex !== null && divisor > 0
    ? Math.round((data[activeIndex].value / divisor) * 100)
    : null

  const takeaway = isLoss
    ? 'This saved projection finishes below what you contributed, so the breakdown highlights the remaining value versus the loss.'
    : hasMonthlyPlan
      ? `You contribute ${formatCurrency(totalContributed)} across the plan. Growth contributes another ${formatCurrency(change)}.`
      : `Each dollar invested grows to roughly ${growthMultiple.toFixed(2)}x in this projection.`

  return (
    <div className="flex flex-col items-center gap-4">
      {isMulti && (
        <div className="northline-chip">
          Top performer · {result.fundName}
        </div>
      )}

      <div className="relative w-full">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={94}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              animationDuration={700}
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={colors[index]}
                  opacity={activeIndex === null ? 1 : activeIndex === index ? 1 : 0.35}
                  style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[120px] flex-col items-center justify-center text-center">
          {hoveredData ? (
            <>
              <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                {formatCurrency(hoveredData.value)}
              </span>
              <span className="mt-1 text-[0.72rem] text-[color:var(--text-muted)]">
                {SHORT_NAMES[hoveredData.name] || hoveredData.name}
                {hoveredPercent !== null ? ` · ${hoveredPercent}%` : ''}
              </span>
            </>
          ) : (
            <>
              <span className="text-lg font-semibold text-[color:var(--text-primary)]">
                {formatCurrency(result.futureValue)}
              </span>
              <span className="mt-1 text-[0.72rem] text-[color:var(--text-muted)]">
                After {years} years
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {data.map((segment, index) => (
          <button
            type="button"
            key={segment.name}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
              activeIndex === index
                ? 'border-[color:var(--line-strong)] bg-[color:var(--surface-muted)]'
                : 'border-[color:var(--line)] bg-[color:var(--surface-strong)]'
            }`}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: colors[index] }} aria-hidden="true" />
            <span className="text-[color:var(--text-secondary)]">{segment.name}</span>
            <span className="font-semibold text-[color:var(--text-primary)]">
              {segment.name === 'Loss' ? `-${formatCurrency(segment.value)}` : formatCurrency(segment.value)}
            </span>
          </button>
        ))}
      </div>

      <p className="text-center text-sm leading-6 text-[color:var(--text-secondary)]">
        {takeaway}
      </p>
    </div>
  )
}

export default PieBreakdown
