const CopilotFAB = ({ onClick, isOpen }) => {
  return (
    <button
      className={`copilot-fab${isOpen ? ' copilot-fab-active' : ''}`}
      onClick={onClick}
      aria-label={isOpen ? 'Close AI Copilot' : 'Open AI Copilot'}
      title="AI Copilot"
    >
      {isOpen ? (
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
        </svg>
      )}
    </button>
  )
}

export default CopilotFAB
