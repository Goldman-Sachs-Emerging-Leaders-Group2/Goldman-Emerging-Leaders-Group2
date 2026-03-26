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
    <div className="flex gap-1.5 items-center justify-end">
      <button
        className="bg-transparent border border-[var(--card-border)] rounded-md text-sm px-2 py-0.5 transition-all duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
        style={{ color: 'var(--text-muted)' }}
        onClick={() => onRerun(investment)}
        title="Load these parameters into the calculator"
      >
        ↻
      </button>
      <button
        className={`bg-transparent border rounded-md px-2 py-0.5 transition-all duration-150 ${
          confirming
            ? 'border-red-500 text-red-500 text-xs font-semibold'
            : 'border-[var(--card-border)] text-sm hover:border-red-500 hover:text-red-500'
        }`}
        style={!confirming ? { color: 'var(--text-muted)' } : undefined}
        onClick={handleDelete}
        title={confirming ? 'Click again to confirm' : 'Delete'}
      >
        {confirming ? 'Sure?' : '✕'}
      </button>
    </div>
  )
}

export default function InvestmentHistory({ investments, onDelete, onRerun, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        Loading saved investments…
      </div>
    )
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
        <span className="text-2xl block mb-2">📁</span>
        <p className="m-0">No saved investments yet</p>
        <p className="text-xs mt-1 opacity-70">Calculate and save results to build your history</p>
      </div>
    )
  }

  const th = 'px-3 py-2.5 text-left font-semibold text-[0.65rem] uppercase tracking-[0.04em]'
  const thR = `${th} text-right`
  const td = 'px-3 py-3 text-left text-[0.8rem]'
  const tdR = `${td} text-right`

  return (
    <table className="w-full border-collapse text-[0.8rem]" style={{ fontVariantNumeric: 'tabular-nums' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
          <th className={th} style={{ color: 'var(--text-muted)' }}>Label</th>
          <th className={th} style={{ color: 'var(--text-muted)' }}>Fund</th>
          <th className={thR} style={{ color: 'var(--text-muted)' }}>Investment</th>
          <th className={thR} style={{ color: 'var(--text-muted)' }}>Monthly</th>
          <th className={`${th} text-center`} style={{ color: 'var(--text-muted)' }}>Years</th>
          <th className={thR} style={{ color: 'var(--text-muted)' }}>Future Value</th>
          <th className={thR} style={{ color: 'var(--text-muted)' }}>CAPM</th>
          <th className={th} style={{ color: 'var(--text-muted)' }}>Saved</th>
          <th className={th}></th>
        </tr>
      </thead>
      <tbody>
        {investments.map((inv) => (
          <tr
            key={inv.id}
            className="transition-colors duration-150 hover:bg-[rgba(181,152,90,0.04)]"
            style={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <td className={td} style={{ color: 'var(--text-primary)' }}>
              <span className="font-medium truncate block max-w-[140px]">
                {inv.label || inv.fundName || '—'}
              </span>
            </td>
            <td className={td}>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{inv.ticker}</span>
            </td>
            <td className={tdR} style={{ color: 'var(--text-primary)' }}>{formatCurrency(inv.initialInvestment)}</td>
            <td className={tdR} style={{ color: 'var(--text-secondary)' }}>{formatCurrency(inv.monthlyContribution)}</td>
            <td className={`${td} text-center`} style={{ color: 'var(--text-secondary)' }}>{inv.years}</td>
            <td className={tdR}>
              <span className="font-semibold" style={{ color: 'var(--accent)' }}>{formatCurrency(inv.futureValue)}</span>
            </td>
            <td className={tdR} style={{ color: 'var(--text-primary)' }}>{formatPercent(inv.capmReturn)}</td>
            <td className={td}>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{timeAgo(inv.savedAt)}</span>
            </td>
            <td className={td}>
              <ActionButtons investment={inv} onDelete={onDelete} onRerun={onRerun} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
