import { formatCurrency, formatPercent } from '../utils/formatters'

const stats = [
  {
    key: 'futureValue',
    label: 'Projected leader',
    getValue: (props) => formatCurrency(props.bestResult?.futureValue),
    getSub: (props) => props.bestResult?.fundName || 'No fund selected',
  },
  {
    key: 'capmReturn',
    label: 'Highest CAPM signal',
    getValue: (props) => formatPercent(props.bestCapmResult?.capmReturn),
    getSub: (props) => props.bestCapmResult?.fundName || 'No fund selected',
  },
  {
    key: 'count',
    label: 'Funds in scope',
    getValue: (props) => props.resultCount,
    getSub: (props) => props.resultCount === 1 ? 'Single scenario' : 'Side-by-side comparison',
  },
]

export default function SummaryStats({ bestResult, bestCapmResult, resultCount }) {
  const props = { bestResult, bestCapmResult, resultCount }

  return (
    <div className="grid gap-4 md:grid-cols-3" id="results-section">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="rounded-[28px] border border-[color:var(--line)] bg-[image:var(--hero-bg)] p-5 shadow-[var(--shadow-soft)]"
        >
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--hero-muted)]">
            {stat.label}
          </span>
          <div className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--hero-text)]">
            {stat.getValue(props)}
          </div>
          <p className="mt-2 text-sm text-[color:var(--hero-muted)]">
            {stat.getSub(props)}
          </p>
        </div>
      ))}
    </div>
  )
}
