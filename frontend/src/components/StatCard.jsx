const StatCard = ({
  label,
  value,
  subText,
  indicatorColor,
  valueClassName,
  isLoading,
  hasError,
}) => {
  const cardClass = `stat-card${isLoading ? ' loading' : ''}${hasError ? ' error' : ''}`

  const renderContent = () => {
    if (hasError) {
      return (
        <>
          <span className="stat-card-value error">&mdash;</span>
          <p className="stat-card-sub muted">Calculation failed</p>
        </>
      )
    }

    if (isLoading) {
      return (
        <>
          <div className="stat-card-skeleton" />
          <p className="stat-card-sub muted">Calculating&hellip;</p>
        </>
      )
    }

    if (value == null) {
      return (
        <>
          <span className="stat-card-value">&mdash;</span>
          <p className="stat-card-sub muted">Awaiting calculation</p>
        </>
      )
    }

    return (
      <>
        <span className={`stat-card-value${valueClassName ? ` ${valueClassName}` : ''}`}>
          {value}
        </span>
        <p className="stat-card-sub">{subText}</p>
      </>
    )
  }

  return (
    <div className={cardClass}>
      <div className={`stat-card-indicator ${indicatorColor}`} />
      <span className="stat-card-label">{label}</span>
      {renderContent()}
    </div>
  )
}

export default StatCard
