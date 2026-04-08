const getRiskLabel = (value) => {
  if (value <= 3) return 'Conservative'
  if (value <= 6) return 'Moderate'
  return 'Aggressive'
}

const formatMoney = (value) => `$${Number(value || 0).toLocaleString()}`

export default function FormSummary({
  tickers,
  investment,
  monthlyContribution = '0',
  years,
  goalAmount = '',
  riskTolerance = 5,
  onExpand,
}) {
  const items = [
    { label: 'Starting amount', value: formatMoney(investment) },
    { label: 'Monthly contribution', value: Number(monthlyContribution) > 0 ? formatMoney(monthlyContribution) : 'None' },
    { label: 'Time horizon', value: `${years} years` },
    { label: 'Goal', value: goalAmount ? formatMoney(goalAmount) : 'Not set' },
    { label: 'Risk comfort', value: `${riskTolerance}/10 · ${getRiskLabel(riskTolerance)}` },
  ]

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="northline-eyebrow mb-2">Scenario summary</p>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
            {tickers.length} {tickers.length === 1 ? 'fund' : 'funds'} in scope
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            Keep this summary visible while you compare funds, save scenarios, or refine the plan.
          </p>
        </div>

        {onExpand && (
          <button
            type="button"
            className="northline-button-secondary"
            onClick={onExpand}
          >
            Edit scenario
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tickers.map((ticker) => (
          <span key={ticker} className="northline-chip">
            {ticker}
          </span>
        ))}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3">
            <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-[color:var(--text-primary)]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
