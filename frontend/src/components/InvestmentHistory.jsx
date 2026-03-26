import { useState, useMemo, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
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

function ActionsRenderer({ data, onDelete, onRerun }) {
  const [confirming, setConfirming] = useState(false)

  const handleDelete = () => {
    if (confirming) {
      onDelete(data.id)
    } else {
      setConfirming(true)
      setTimeout(() => setConfirming(false), 2000)
    }
  }

  return (
    <div className="flex gap-1.5 items-center h-full">
      <button
        className="bg-transparent border border-[var(--card-border,#E2E8F0)] rounded-md cursor-pointer text-sm px-2 py-0.5 text-[var(--text-secondary,#4A5568)] transition-all hover:bg-gold/10 hover:border-[var(--accent,#B5985A)] hover:text-[var(--accent,#B5985A)]"
        onClick={() => onRerun(data)}
        title="Load these parameters into the calculator"
      >
        ↻
      </button>
      <button
        className={`bg-transparent border rounded-md cursor-pointer px-2 py-0.5 transition-all ${
          confirming
            ? 'border-red-600 text-red-600 bg-red-600/[0.08] text-xs font-semibold'
            : 'border-[var(--card-border,#E2E8F0)] text-[var(--text-secondary,#4A5568)] text-sm hover:bg-red-600/[0.08] hover:border-red-600 hover:text-red-600'
        }`}
        onClick={handleDelete}
        title={confirming ? 'Click again to confirm' : 'Delete this entry'}
      >
        {confirming ? 'Sure?' : '✕'}
      </button>
    </div>
  )
}

export default function InvestmentHistory({ investments, onDelete, onRerun, isLoading }) {
  const columnDefs = useMemo(() => [
    {
      field: 'label',
      headerName: 'Label',
      width: 140,
      valueFormatter: ({ data }) => data.label || data.fundName || '—',
    },
    { field: 'ticker', headerName: 'Fund', width: 85 },
    {
      field: 'initialInvestment',
      headerName: 'Investment',
      width: 120,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
    {
      field: 'monthlyContribution',
      headerName: 'Monthly',
      width: 100,
      valueFormatter: ({ value }) => formatCurrency(value),
    },
    { field: 'years', headerName: 'Years', width: 70 },
    {
      field: 'futureValue',
      headerName: 'Future Value',
      width: 130,
      valueFormatter: ({ value }) => formatCurrency(value),
      cellStyle: { fontWeight: 600, color: 'var(--accent, #B5985A)' },
    },
    {
      field: 'capmReturn',
      headerName: 'CAPM',
      width: 90,
      valueFormatter: ({ value }) => formatPercent(value),
    },
    {
      field: 'savedAt',
      headerName: 'Saved',
      width: 110,
      valueFormatter: ({ value }) => timeAgo(value),
      sort: 'desc',
    },
    {
      headerName: '',
      width: 95,
      sortable: false,
      resizable: false,
      cellRenderer: ActionsRenderer,
      cellRendererParams: { onDelete, onRerun },
    },
  ], [onDelete, onRerun])

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
  }), [])

  const getRowId = useCallback(({ data }) => String(data.id), [])

  if (isLoading) {
    return <div className="text-center py-10 text-[var(--text-muted,#8896A6)]">Loading saved investments…</div>
  }

  if (!investments || investments.length === 0) {
    return (
      <div className="text-center py-10 text-[var(--text-muted,#8896A6)]">
        <span className="text-2xl block mb-2">📁</span>
        <p>No saved investments yet</p>
        <p className="text-xs mt-1 opacity-70">Calculate and save results to build your history</p>
      </div>
    )
  }

  return (
    <div className="ag-theme-quartz gs-ag-theme w-full">
      <AgGridReact
        rowData={investments}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        domLayout="autoHeight"
        pagination={true}
        paginationPageSize={10}
        getRowId={getRowId}
        animateRows={true}
        suppressCellFocus={true}
      />
    </div>
  )
}
