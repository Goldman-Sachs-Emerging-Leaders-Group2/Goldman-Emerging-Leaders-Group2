import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '../utils/formatters'

const PLANNING_PRINCIPLES = [
  {
    title: 'Start with a realistic contribution plan',
    description: 'The most useful projection begins with what you can actually invest now and what you can reliably add each month.',
  },
  {
    title: 'Compare funds on the same assumptions',
    description: 'Changing the deposit amount or timeline between funds makes the comparison noisy. Keep the assumptions fixed and let the fund data vary.',
  },
  {
    title: 'Treat projections as guidance, not guarantees',
    description: 'CAPM and historical returns can frame tradeoffs, but they are still estimates. Use them to inform a decision, not to promise an outcome.',
  },
]

const VOCABULARY = [
  { term: 'Mutual fund', definition: 'A pool of investments managed together. It helps you own many securities in one purchase.' },
  { term: 'Benchmark', definition: 'A reference fund or index used to compare how another investment is performing.' },
  { term: 'CAPM', definition: 'A model that estimates expected return using market return, a risk-free baseline, and a fund’s beta.' },
  { term: 'Risk-free rate', definition: 'A baseline return drawn from Treasury-style assets and used as the starting point for CAPM.' },
  { term: 'Beta', definition: 'A measure of how much a fund tends to move relative to the broader market.' },
  { term: 'Compound growth', definition: 'Growth that earns returns on both your original contributions and prior gains.' },
]

const GUIDANCE_NOTES = [
  'Favor consistency over perfectly timing the market. A dependable monthly contribution habit often matters more than a one-time guess.',
  'Use your risk slider honestly. A projection that keeps you invested is more useful than an aggressive plan you will abandon in a downturn.',
  'Revisit assumptions when your income, savings capacity, or goal changes. The most trustworthy projection is the one that still matches your life.',
]

const clampNonNegative = (value) => Math.max(0, Number.isFinite(value) ? value : 0)

const formatYAxisTick = (value) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${Math.round(value)}`
}

const LearnChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null

  const totalValue = payload.find((entry) => entry.dataKey === 'total')?.value ?? 0
  const contributedValue = payload.find((entry) => entry.dataKey === 'contributions')?.value ?? 0

  return (
    <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-4 text-sm shadow-[var(--shadow-soft)]">
      <p className="font-semibold text-[color:var(--text-primary)]">Year {label}</p>
      <div className="mt-2 grid gap-2">
        <p className="text-xs font-medium text-[color:var(--signal)]">
          Projected total: {formatCurrency(totalValue)}
        </p>
        <p className="text-xs font-medium text-[color:var(--text-secondary)]">
          Total contributed: {formatCurrency(contributedValue)}
        </p>
      </div>
    </div>
  )
}

export default function LearnPanel({ onStartPlan }) {
  const [principal, setPrincipal] = useState(1000)
  const [contribution, setContribution] = useState(100)
  const [years, setYears] = useState(10)
  const [rate, setRate] = useState(8)

  const safePrincipal = clampNonNegative(principal)
  const safeContribution = clampNonNegative(contribution)
  const safeYears = Math.max(1, Math.min(40, Math.round(years) || 1))
  const safeRate = Math.max(0, Math.min(15, rate || 0))

  const compoundData = useMemo(() => {
    let total = safePrincipal
    let totalContributions = safePrincipal
    const yearlyData = [{ year: 0, total: Math.round(total), contributions: Math.round(totalContributions) }]

    for (let index = 1; index <= safeYears; index += 1) {
      const annualContribution = safeContribution * 12
      totalContributions += annualContribution
      total = (total + annualContribution) * (1 + safeRate / 100)
      yearlyData.push({ year: index, total: Math.round(total), contributions: Math.round(totalContributions) })
    }

    return yearlyData
  }, [safeContribution, safePrincipal, safeRate, safeYears])

  const endingValue = compoundData[compoundData.length - 1].total
  const endingContributions = compoundData[compoundData.length - 1].contributions

  return (
    <section className="grid gap-8 py-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="northline-eyebrow mb-3">Planning basics</p>
          <h1 className="northline-page-title">
            Learn the building blocks behind a sound comparison.
          </h1>
          <p className="mt-4 max-w-[62ch] text-base leading-8 text-[color:var(--text-secondary)]">
            This section explains the core ideas behind Northline in plain language: how contributions, time horizon, CAPM, and risk all shape the comparison you see on the results screen.
          </p>
        </div>

        <div className="northline-card rounded-[28px] p-6">
          <p className="northline-eyebrow mb-2">Quick start</p>
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
            Prefer learning by doing?
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
            Build a comparison first, then come back here when you want more context on the numbers.
          </p>
          <button type="button" className="northline-button-primary mt-5" onClick={onStartPlan}>
            Start a plan
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLANNING_PRINCIPLES.map((principle) => (
          <div key={principle.title} className="northline-card rounded-[28px] p-6">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
              {principle.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              {principle.description}
            </p>
          </div>
        ))}
      </div>

      <div className="northline-card rounded-[32px] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="northline-eyebrow mb-2">Compound growth</p>
            <h2 className="text-[1.85rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
              See how a steady plan can grow over time.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">
              Adjust the controls to understand how time horizon, expected return, and recurring deposits affect the total value. This is a teaching aid, not a promise of future returns.
            </p>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">Starting amount</span>
                <input type="number" min="0" step="100" value={principal} onChange={(event) => setPrincipal(Number(event.target.value))} className="northline-input" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">Monthly contribution</span>
                <input type="number" min="0" step="25" value={contribution} onChange={(event) => setContribution(Number(event.target.value))} className="northline-input" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">Years</span>
                <input type="range" min="1" max="40" value={safeYears} onChange={(event) => setYears(Number(event.target.value))} className="northline-range" />
                <span className="text-sm text-[color:var(--text-secondary)]">{safeYears} years</span>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">Expected annual return</span>
                <input type="range" min="0" max="15" step="0.5" value={safeRate} onChange={(event) => setRate(Number(event.target.value))} className="northline-range" />
                <span className="text-sm text-[color:var(--text-secondary)]">{safeRate}%</span>
              </label>
            </div>
          </div>

          <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="northline-eyebrow mb-2">Projected total</p>
                <div className="text-4xl font-semibold tracking-[-0.04em] text-[color:var(--signal)]">
                  {formatCurrency(endingValue)}
                </div>
              </div>
              <div className="grid gap-1 text-right">
                <div className="northline-chip justify-center">
                  Educational example
                </div>
                <p className="text-sm font-medium text-[color:var(--text-secondary)]">
                  Contributed: {formatCurrency(endingContributions)}
                </p>
              </div>
            </div>

            <div className="mt-8 border-t border-[color:var(--line)] pt-6" aria-label="Compound growth chart">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={compoundData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="learn-growth-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="4 6" vertical={false} />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    tickCount={Math.min(safeYears + 1, 6)}
                  />
                  <YAxis
                    tickFormatter={formatYAxisTick}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={66}
                  />
                  <Tooltip
                    content={<LearnChartTooltip />}
                    cursor={{ stroke: 'var(--line-strong)', strokeDasharray: '4 6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="contributions"
                    stroke="var(--text-muted)"
                    strokeWidth={1.6}
                    strokeDasharray="6 4"
                    fill="none"
                    dot={false}
                    isAnimationActive={false}
                    name="Contributions"
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="var(--signal)"
                    strokeWidth={2.3}
                    fill="url(#learn-growth-gradient)"
                    dot={false}
                    isAnimationActive={false}
                    name="Projected total"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              Projection window: Year 0 to Year {safeYears}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="northline-card rounded-[28px] p-6">
          <p className="northline-eyebrow mb-2">Vocabulary</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            Terms you will see across Northline.
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {VOCABULARY.map((item) => (
              <div key={item.term} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
                <h3 className="text-base font-semibold text-[color:var(--text-primary)]">{item.term}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{item.definition}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="northline-card rounded-[28px] p-6">
          <p className="northline-eyebrow mb-2">Guidance notes</p>
          <h2 className="text-[1.6rem] font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">
            Three habits that make the comparison more useful.
          </h2>
          <div className="mt-5 grid gap-4">
            {GUIDANCE_NOTES.map((note) => (
              <div key={note} className="rounded-[22px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4 text-sm leading-6 text-[color:var(--text-secondary)]">
                {note}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
