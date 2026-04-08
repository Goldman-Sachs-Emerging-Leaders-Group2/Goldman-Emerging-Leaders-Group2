import { useCallback, useEffect, useRef, useState } from 'react'
import { sendCopilotMessage } from '../api/copilot'
import { buildCopilotContext, getChipsForView } from '../utils/copilotContext'

const MODES = [
  { key: 'teach', label: 'Teach' },
  { key: 'builder', label: 'Builder' },
  { key: 'summary', label: 'Summary' },
]

const WELCOME = {
  teach: "Hi! I can help you understand CAPM concepts, financial terms, and how to use this tool. What would you like to learn?",
  builder: "I can help you think through fund allocation based on your risk tolerance and goals. What kind of investor are you?",
  summary: "I can summarize your current comparison results and highlight key insights. Build a comparison first, then ask me to break it down!",
}

function formatMarkdown(text) {
  let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/\n/g, '<br />')
  return html
}

function Message({ role, content, mode }) {
  const isUser = role === 'user'
  return (
    <div className={`max-w-[90%] ${isUser ? 'self-end' : 'self-start'}`}>
      {!isUser && (
        <div className="mb-1 flex items-center gap-1.5">
          <svg className="h-3 w-3 text-[color:var(--signal)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="text-[0.68rem] font-semibold tracking-wide text-[color:var(--signal)]">Northline AI</span>
        </div>
      )}
      <div
        className={[
          'rounded-2xl px-3.5 py-2.5 text-[0.82rem] leading-relaxed',
          isUser
            ? 'border border-[color:var(--signal)]/20 bg-[color:var(--signal)]/8 text-[color:var(--text-primary)]'
            : 'border border-[color:var(--line)] bg-[color:var(--surface-muted)] text-[color:var(--text-secondary)] border-l-[3px] border-l-[color:var(--signal)]',
        ].join(' ')}
        dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
      />
      {!isUser && (mode === 'builder' || mode === 'summary') && (
        <p className="mt-1 pl-3.5 text-[0.65rem] italic text-[color:var(--text-muted)]">
          {mode === 'builder' ? 'Educational guidance, not financial advice.' : 'Based on CAPM projections, not guaranteed returns.'}
        </p>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="self-start max-w-[90%]">
      <div className="mb-1 flex items-center gap-1.5">
        <svg className="h-3 w-3 text-[color:var(--signal)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
        </svg>
        <span className="text-[0.68rem] font-semibold tracking-wide text-[color:var(--signal)]">Northline AI</span>
      </div>
      <div className="flex w-fit gap-1.5 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-3.5 py-2.5 border-l-[3px] border-l-[color:var(--signal)]">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--signal)]" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--signal)]" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[color:var(--signal)]" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

export default function CopilotPanel({ isOpen, onClose, results, funds, form, activeView, monthlyContribution }) {
  const [activeMode, setActiveMode] = useState('teach')
  const [messages, setMessages] = useState([{ role: 'ai', content: WELCOME.teach }])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chips, setChips] = useState(() => getChipsForView('home'))

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setChips(getChipsForView(activeView))
  }, [activeView])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen])

  const handleModeSwitch = useCallback((mode) => {
    setActiveMode(mode)
    setMessages([{ role: 'ai', content: WELCOME[mode] }])
    setChips(getChipsForView(activeView))
    setInput('')
  }, [activeView])

  const handleSend = useCallback(async (text) => {
    const msg = text || input.trim()
    if (!msg || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setIsLoading(true)
    setChips([])

    try {
      const context = buildCopilotContext({ results, form, funds, activeView, monthlyContribution })
      const response = await sendCopilotMessage({ mode: activeMode, message: msg, context })
      setMessages((prev) => [...prev, { role: 'ai', content: response.reply }])
      setChips(response.suggestions?.length > 0 ? response.suggestions : getChipsForView(activeView))
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${error.message}` }])
      setChips(getChipsForView(activeView))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, results, form, funds, activeView, monthlyContribution, activeMode])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={[
        'fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-[color:var(--line)] bg-[color:var(--bg)] shadow-[-4px_0_24px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sm:w-[400px]',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {/* Header */}
      <div className="border-b border-[color:var(--line)] px-5 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-[color:var(--signal)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="text-base font-semibold tracking-tight text-[color:var(--text-primary)]">Northline Copilot</span>
          <button
            type="button"
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md border-none bg-transparent text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-muted)] hover:text-[color:var(--text-primary)]"
            onClick={onClose}
            aria-label="Close copilot"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <p className="mt-0.5 text-[0.68rem] text-[color:var(--text-muted)]">Educational guidance only</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-0.5 border-b border-[color:var(--line)] px-5 py-2">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={[
              'flex-1 rounded-lg px-2 py-1.5 text-[0.78rem] font-semibold transition',
              key === activeMode
                ? 'bg-[color:var(--signal)]/12 text-[color:var(--signal)] border border-[color:var(--signal)]/25'
                : 'border border-[color:var(--line)] text-[color:var(--text-muted)] hover:text-[color:var(--text-secondary)]',
            ].join(' ')}
            onClick={() => handleModeSwitch(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.content} mode={activeMode} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chips */}
      {chips.length > 0 && !isLoading && (
        <div className="flex flex-wrap gap-1.5 border-t border-[color:var(--line)] px-5 py-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="whitespace-nowrap rounded-full border border-[color:var(--line)] bg-transparent px-2.5 py-1 text-[0.72rem] text-[color:var(--text-muted)] transition hover:border-[color:var(--signal)]/30 hover:text-[color:var(--signal)]"
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 border-t border-[color:var(--line)] bg-[color:var(--surface-elevated)] px-5 py-3">
        <input
          ref={inputRef}
          type="text"
          className="northline-input flex-1 !rounded-lg !py-2 !text-[0.82rem]"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={500}
        />
        <button
          type="button"
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-[color:var(--navy)] text-white transition hover:opacity-90 disabled:opacity-40"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
