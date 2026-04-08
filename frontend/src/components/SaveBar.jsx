export default function SaveBar({ label, onLabelChange, onSave, saveStatus, resultCount, error }) {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') onSave()
  }

  const isSaving = saveStatus === 'saving'
  const isSaved = saveStatus === 'saved'

  return (
    <div className="northline-card rounded-[28px] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-[44ch]">
          <p className="northline-eyebrow mb-2">Save your work</p>
          <h3 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--text-primary)]">
            Keep this comparison for later.
          </h3>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">
            Save {resultCount > 1 ? 'these scenarios' : 'this scenario'} with a label so you can reopen the results and compare them later.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 xl:max-w-[540px] xl:flex-row">
          <input
            type="text"
            className="northline-input flex-1"
            placeholder="Scenario label, for example First home plan"
            value={label}
            onChange={(event) => onLabelChange(event.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Scenario label"
          />
          <button
            type="button"
            className={isSaved ? 'northline-button-secondary justify-center' : 'northline-button-primary justify-center'}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving
              ? 'Saving…'
              : isSaved
                ? 'Saved'
                : `Save ${resultCount > 1 ? 'scenarios' : 'scenario'}`}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-[color:var(--error)]">{error}</p>
      )}
    </div>
  )
}
