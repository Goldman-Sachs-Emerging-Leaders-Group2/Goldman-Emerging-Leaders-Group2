const calcFV = (initial, capmReturn, monthly, year) => {
  const lumpSum = initial * Math.exp(capmReturn * year)
  if (monthly <= 0 || year <= 0) return lumpSum
  const monthlyRate = Math.exp(capmReturn / 12) - 1
  if (Math.abs(monthlyRate) < 1e-10) {
    // Near-zero rate: contributions accumulate without growth
    return lumpSum + monthly * 12 * year
  }
  const annuity = monthly * (Math.exp(capmReturn * year) - 1) / monthlyRate
  return lumpSum + annuity
}

const calcContributed = (initial, monthly, year) => initial + monthly * 12 * year

export const generateProjectionData = (result) => {
  const { initialInvestment, capmReturn, years, monthlyContribution = 0 } = result
  const data = []

  for (let year = 0; year <= years; year++) {
    data.push({
      year,
      value: calcFV(initialInvestment, capmReturn, monthlyContribution, year),
      contributed: calcContributed(initialInvestment, monthlyContribution, year),
    })
  }

  return data
}

export const generateMultiProjectionData = (results) => {
  const tickers = Object.keys(results)
  if (tickers.length === 0) return []

  const firstResult = results[tickers[0]]
  const years = firstResult.years
  const monthly = firstResult.monthlyContribution || 0
  const initial = firstResult.initialInvestment
  const data = []

  for (let year = 0; year <= years; year++) {
    const point = { year, contributed: calcContributed(initial, monthly, year) }
    for (const ticker of tickers) {
      const r = results[ticker]
      point[ticker] = calcFV(r.initialInvestment, r.capmReturn, r.monthlyContribution || 0, year)
    }
    data.push(point)
  }

  return data
}
