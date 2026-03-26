import { formatCurrency, formatPercent } from '../utils/formatters'

const statCardBase =
  'flex flex-col gap-0.5 rounded-xl animate-[scaleIn_0.8s_cubic-bezier(0.16,1,0.3,1)_both]'

const stats = [
  {
    key: 'futureValue',
    label: 'Best Future Value',
    delay: '0s',
    getValue: (props) => formatCurrency(props.bestResult?.futureValue),
    getSub: (props) => props.bestResult?.fundName,
  },
  {
    key: 'capmReturn',
    label: 'Best CAPM Return',
    delay: '0.12s',
    getValue: (props) => formatPercent(props.bestCapmResult?.capmReturn),
    getSub: (props) => props.bestCapmResult?.fundName,
  },
  {
    key: 'count',
    label: 'Funds Compared',
    delay: '0.24s',
    getValue: (props) => props.resultCount,
    getSub: (props) =>
      props.resultCount === 1 ? 'single fund' : 'multi-fund comparison',
  },
]

export default function SummaryStats({ bestResult, bestCapmResult, resultCount }) {
  const props = { bestResult, bestCapmResult, resultCount }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-[fadeInUp_0.4s_ease-out]"
      id="results-section"
    >
      {stats.map((s) => (
        <div
          key={s.key}
          className={statCardBase}
          style={{
            background: 'var(--hero-card-bg)',
            border: '1px solid var(--hero-card-border)',
            padding: '1.25rem',
            animationDelay: s.delay,
          }}
        >
          <span
            className="text-[0.7rem] font-semibold uppercase tracking-wide"
            style={{ color: 'var(--hero-card-muted)' }}
          >
            {s.label}
          </span>
          <span
            className="text-2xl font-bold leading-tight"
            style={{ color: 'var(--hero-card-text)', fontVariantNumeric: 'tabular-nums' }}
          >
            {s.getValue(props)}
          </span>
          <span
            className="text-xs"
            style={{ color: 'var(--hero-card-muted)' }}
          >
            {s.getSub(props)}
          </span>
        </div>
      ))}
    </div>
  )
}
