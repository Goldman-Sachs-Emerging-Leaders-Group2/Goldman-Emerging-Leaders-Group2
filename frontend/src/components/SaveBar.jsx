export default function SaveBar({ label, onLabelChange, onSave, saveStatus, resultCount, error }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSave()
  }

  const isSaving = saveStatus === 'saving'
  const isSaved = saveStatus === 'saved'

  return (
    <div
      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-5 rounded-lg"
      style={{
        background: 'var(--card-bg, #fff)',
        border: '1px solid var(--card-border, #E2E8F0)',
      }}
    >
      <input
        type="text"
        className="flex-1 px-3 py-2.5 rounded-lg text-sm outline-none transition-colors duration-200 border border-[var(--card-border,#E2E8F0)] focus:border-[var(--accent,#B5985A)]"
        style={{
          background: 'var(--input-bg, #fff)',
          color: 'var(--text-primary, #00244D)',
        }}
        placeholder="Label (optional) — e.g., Retirement plan"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button
        className={`px-5 py-2.5 text-white text-sm font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:enabled:-translate-y-px ${
          isSaved ? 'bg-emerald-600' : ''
        }`}
        style={!isSaved ? { background: 'var(--accent, #B5985A)' } : undefined}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving
          ? 'Saving\u2026'
          : isSaved
            ? '\u2713 Saved'
            : `Save Result${resultCount > 1 ? 's' : ''}`}
      </button>
      {error && (
        <p className="text-xs text-red-500 w-full sm:w-auto">{error}</p>
      )}
    </div>
  )
}
