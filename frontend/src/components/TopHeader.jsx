import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { formatPercent } from '../utils/formatters'
import NotificationPanel from './NotificationPanel'

const ROUTE_TITLES = {
  '/': 'Dashboard',
  '/calculator': 'Calculator',
  '/portfolio': 'Portfolio',
  '/history': 'History',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
}

const TYPE_LABELS = {
  MUTUAL_FUND: 'MF',
  ETF: 'ETF',
}

const TopHeader = () => {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = ROUTE_TITLES[pathname] || 'CAPM Dashboard'

  const { assets, handleToggleTicker, form, notifications, unreadCount, markAllRead, clearNotifications } = useAppContext()

  // Search state
  const [query, setQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)

  // Notification state
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  const filteredAssets = query.trim()
    ? assets.filter((a) => {
        const q = query.toLowerCase()
        return a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)
      })
    : []

  const handleSearchChange = (e) => {
    setQuery(e.target.value)
    setShowSearch(true)
  }

  const handleSearchFocus = () => {
    if (query.trim()) {
      setShowSearch(true)
    }
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSearch(false)
      e.target.blur()
    }
  }

  const handleSelectAsset = (ticker) => {
    if (!form.tickers.includes(ticker)) {
      handleToggleTicker(ticker)
    }
    setQuery('')
    setShowSearch(false)
    navigate('/calculator')
  }

  const handleToggleNotifications = () => {
    setShowNotifications((prev) => {
      if (!prev) markAllRead()
      return !prev
    })
    setShowSearch(false)
  }

  const handleClearNotifications = () => {
    clearNotifications()
    setShowNotifications(false)
  }

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="top-header">
      <span className="top-header-title">{title}</span>
      <div className="top-header-actions">
        <div className="search-bar-wrapper" ref={searchRef}>
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search assets…"
              value={query}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {showSearch && query.trim() && (
            <div className="search-dropdown">
              {filteredAssets.length === 0 ? (
                <div className="search-empty">No assets found</div>
              ) : (
                filteredAssets.map((asset) => {
                  const selected = form.tickers.includes(asset.ticker)
                  return (
                    <button
                      key={asset.ticker}
                      className={`search-result-item${selected ? ' selected' : ''}`}
                      onClick={() => handleSelectAsset(asset.ticker)}
                    >
                      <span className="search-result-badge">{TYPE_LABELS[asset.type] || asset.type}</span>
                      <span className="search-result-ticker">{asset.ticker}</span>
                      <span className="search-result-name">{asset.name}</span>
                      <span className="search-result-return">{formatPercent(asset.expectedAnnualReturn)}</span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        <div className="notification-wrapper" ref={notifRef}>
          <button className="icon-btn" aria-label="Notifications" onClick={handleToggleNotifications}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel
              notifications={notifications}
              onClear={handleClearNotifications}
            />
          )}
        </div>
        <div className="header-avatar">N</div>
      </div>
    </header>
  )
}

export default TopHeader
