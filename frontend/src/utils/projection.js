export const generateProjectionData = (result) => {
  const { initialInvestment, capmReturn, years } = result
  const data = []

  for (let year = 0; year <= years; year++) {
    data.push({
      year,
      value: initialInvestment * Math.exp(capmReturn * year),
    })
  }

  return data
}

export const generateMultiProjectionData = (results) => {
  const tickers = Object.keys(results)
  if (tickers.length === 0) return []

  const firstResult = results[tickers[0]]
  const years = firstResult.years
  const data = []

  for (let year = 0; year <= years; year++) {
    const point = { year }
    for (const ticker of tickers) {
      const r = results[ticker]
      point[ticker] = r.initialInvestment * Math.exp(r.capmReturn * year)
    }
    data.push(point)
  }

  return data
}
