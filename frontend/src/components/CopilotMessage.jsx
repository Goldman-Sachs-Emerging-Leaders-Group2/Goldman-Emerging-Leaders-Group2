const formatMarkdown = (text) => {
  // Bold: **text**
  let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Line breaks
  html = html.replace(/\n/g, '<br />')
  return html
}

const CopilotMessage = ({ role, content, mode }) => {
  const isUser = role === 'user'

  return (
    <div className={`copilot-message ${isUser ? 'copilot-message-user' : 'copilot-message-ai'}`}>
      {!isUser && (
        <div className="copilot-message-header">
          <svg className="copilot-sparkle-sm" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="copilot-message-label">CapmFlow AI</span>
        </div>
      )}
      <div
        className="copilot-message-body"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
      {!isUser && (mode === 'builder' || mode === 'summary') && (
        <div className="copilot-disclaimer">
          {mode === 'builder'
            ? 'Educational guidance, not financial advice.'
            : 'Based on CAPM projections, not guaranteed returns.'}
        </div>
      )}
    </div>
  )
}

export const CopilotTypingIndicator = () => (
  <div className="copilot-message copilot-message-ai">
    <div className="copilot-message-header">
      <svg className="copilot-sparkle-sm" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
      </svg>
      <span className="copilot-message-label">CapmFlow AI</span>
    </div>
    <div className="copilot-typing">
      <span className="copilot-typing-dot" />
      <span className="copilot-typing-dot" />
      <span className="copilot-typing-dot" />
    </div>
  </div>
)

export default CopilotMessage
