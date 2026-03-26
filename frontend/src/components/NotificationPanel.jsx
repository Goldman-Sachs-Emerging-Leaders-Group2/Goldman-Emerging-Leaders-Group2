const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const TYPE_ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
}

const NotificationPanel = ({ notifications, onClear }) => {
  if (notifications.length === 0) {
    return (
      <div className="notification-panel">
        <div className="notification-panel-header">
          <span className="notification-panel-title">Notifications</span>
        </div>
        <div className="notification-empty">No notifications</div>
      </div>
    )
  }

  return (
    <div className="notification-panel">
      <div className="notification-panel-header">
        <span className="notification-panel-title">Notifications</span>
        <button className="notification-clear" onClick={onClear}>Clear all</button>
      </div>
      <div className="notification-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notification-item ${n.type}${n.read ? '' : ' unread'}`}>
            <span className={`notification-icon ${n.type}`}>{TYPE_ICONS[n.type]}</span>
            <div className="notification-content">
              <p className="notification-message">{n.message}</p>
              <span className="notification-time">{formatTimeAgo(n.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPanel
