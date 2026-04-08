import { useState } from 'react'
import { formatCurrency, formatPercent } from '../utils/formatters'

const timeAgo = (dateStr) => {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function ActionButtons({ investment, onDelete, onRerun }) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) {
      onDelete(investment.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2000)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="northline-button-secondary"
        onClick={() => onRerun(investment)}
        title="Open in results"
      >
        Open in results
      </button>
      <button
        type="button"
        className={confirming ? 'northline-button-secondary text-[color:var(--error)]' : 'northline-button-secondary'}
        onClick={handleDelete}
        title={confirming ? 'Click again to confirm delete' : 'Delete scenario'}
      >
        {confirming ? 'Confirm delete' : 'Delete'}
      </button>
    </div>
  )
}

const Stat = ({ label, value, emphasis = false }) => (
  <div className="rounded-[20px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3">
    <dt className="text-xs uppercase tracking-[0.16em] text-[color:var(--text-muted)]">
      {label}
    </dt>
    <dd className={`mt-1 text-sm ${emphasis ? 'font-semibold text-[color:var(--signal)]' : 'font-semibold text-[color:var(--text-primary)]'}`}>
      {value}
    </dd>
  </div>
)

export default function InvestmentHistory({ investments, onDelete, onRerun, isLoading }) {
  if (isLoading) {
    return (
      <div className="northline-empty-state">
        Loading saved scenarios…
      </div>
    )
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="northline-empty-state">
        No saved scenarios yet. Save a comparison to build a history you can revisit.
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {investments.map((investment) => (
        <article key={investment.id} className="northline-card rounded-[28px] p-5 sm:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="grid flex-1 gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="northline-eyebrow mb-2">{timeAgo(investment.savedAt)}</p>
                  <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
                    {investment.label || investment.fundName || investment.ticker}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
                    {investment.ticker} · {investment.fundName}
                  </p>
                </div>
                <span className="northline-chip self-start">
                  {formatCurrency(investment.futureValue)}
                </span>
              </div>

              <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <Stat label="Starting amount" value={formatCurrency(investment.initialInvestment)} />
                <Stat label="Monthly contribution" value={formatCurrency(investment.monthlyContribution)} />
                <Stat label="Time horizon" value={`${investment.years} years`} />
                <Stat label="CAPM return" value={formatPercent(investment.capmReturn)} />
                <Stat label="Projected value" value={formatCurrency(investment.futureValue)} emphasis />
              </dl>
            </div>

            <ActionButtons investment={investment} onDelete={onDelete} onRerun={onRerun} />
          </div>
        </article>
      ))}
    </div>
  )
}
