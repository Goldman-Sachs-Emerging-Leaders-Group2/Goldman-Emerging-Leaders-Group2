const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const formatCurrency = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '—'
  }

  return currencyFormatter.format(number)
}

export const formatPercent = (value) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '—'
  }

  return `${(number * 100).toFixed(2)}%`
}

export const formatDecimal = (value, digits = 2) => {
  const number = Number(value)
  if (!Number.isFinite(number)) {
    return '—'
  }

  return number.toFixed(digits)
}
