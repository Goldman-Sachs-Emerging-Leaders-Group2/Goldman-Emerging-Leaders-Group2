import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { sendCopilotMessage } from '../api/copilot'
import { buildCopilotContext, getChipsForPage } from '../utils/copilotContext'
import CopilotMessage, { CopilotTypingIndicator } from './CopilotMessage'

const MODES = [
  { key: 'teach', label: 'Teach' },
  { key: 'builder', label: 'Builder' },
  { key: 'summary', label: 'Summary' },
]

const WELCOME_MESSAGES = {
  teach: "Hi! I'm your CapmFlow Copilot. I can help you understand CAPM concepts, financial terms, and how to use this calculator. What would you like to learn?",
  builder: "I can help you think through portfolio allocation based on your risk tolerance and goals. What kind of investor are you?",
  summary: "I can summarize your current portfolio results and highlight key insights. Run a calculation first, then ask me to break it down!",
}

const CopilotPanel = ({ isOpen, onClose, initialMessage }) => {
  const { results, form, assets } = useAppContext()
  const { pathname } = useLocation()

  const [activeMode, setActiveMode] = useState('teach')
  const [messages, setMessages] = useState([
    { role: 'ai', content: WELCOME_MESSAGES.teach },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chips, setChips] = useState(() => getChipsForPage('/'))

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const initialMessageHandled = useRef(false)

  // Update chips when page changes
  useEffect(() => {
    setChips(getChipsForPage(pathname))
  }, [pathname])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Handle initial message from "Explain This" buttons
  useEffect(() => {
    if (isOpen && initialMessage && !initialMessageHandled.current) {
      initialMessageHandled.current = true
      handleSend(initialMessage)
    }
    if (!isOpen) {
      initialMessageHandled.current = false
    }
  }, [isOpen, initialMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeSwitch = useCallback((mode) => {
    setActiveMode(mode)
    setMessages([{ role: 'ai', content: WELCOME_MESSAGES[mode] }])
    setChips(getChipsForPage(pathname))
    setInput('')
  }, [pathname])

  const handleSend = useCallback(async (text) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: messageText }])
    setIsLoading(true)
    setChips([])

    try {
      const context = buildCopilotContext({ results, form, assets, currentPage: pathname })
      const response = await sendCopilotMessage({
        mode: activeMode,
        message: messageText,
        context,
      })

      setMessages((prev) => [...prev, { role: 'ai', content: response.reply }])

      if (response.suggestions && response.suggestions.length > 0) {
        setChips(response.suggestions)
      } else {
        setChips(getChipsForPage(pathname))
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: `Sorry, I encountered an error: ${error.message}` },
      ])
      setChips(getChipsForPage(pathname))
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, results, form, assets, pathname, activeMode])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`copilot-panel${isOpen ? ' copilot-panel-open' : ''}`}>
      {/* Header */}
      <div className="copilot-panel-header">
        <div className="copilot-panel-title-row">
          <svg className="copilot-sparkle" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z" />
          </svg>
          <span className="copilot-panel-title">CapmFlow Copilot</span>
          <button className="copilot-close-btn" onClick={onClose} aria-label="Close copilot">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <span className="copilot-panel-subtitle">Educational guidance only</span>
      </div>

      {/* Mode Tabs */}
      <div className="copilot-mode-tabs">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            className={`copilot-mode-tab${key === activeMode ? ' active' : ''}`}
            onClick={() => handleModeSwitch(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="copilot-messages">
        {messages.map((msg, i) => (
          <CopilotMessage key={i} role={msg.role} content={msg.content} mode={activeMode} />
        ))}
        {isLoading && <CopilotTypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick-Action Chips */}
      {chips.length > 0 && !isLoading && (
        <div className="copilot-chips">
          {chips.map((chip) => (
            <button
              key={chip}
              className="copilot-chip"
              onClick={() => handleSend(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="copilot-input-row">
        <input
          ref={inputRef}
          type="text"
          className="copilot-input"
          placeholder="Ask me anything…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          maxLength={500}
        />
        <button
          className="copilot-send-btn"
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CopilotPanel
