export default function CopilotFAB({ onClick, isOpen }) {
  return (
    <button
      type="button"
      className={[
        'fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--line)] shadow-lg transition-all duration-200 hover:scale-105',
        isOpen
          ? 'bg-[color:var(--surface-strong)] text-[color:var(--text-secondary)] shadow-[var(--shadow)]'
          : 'bg-[color:var(--navy)] text-white shadow-[var(--shadow)]',
      ].join(' ')}
      onClick={onClick}
      aria-label={isOpen ? 'Close AI Copilot' : 'Open AI Copilot'}
      title="AI Copilot"
    >
      {isOpen ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
        </svg>
      )}
    </button>
  )
}
