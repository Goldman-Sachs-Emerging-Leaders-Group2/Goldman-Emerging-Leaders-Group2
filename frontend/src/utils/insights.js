import { formatCurrency, formatDecimal, formatPercent } from './formatters'

const INFLATION_RATE = 0.03

export const generateInsights = (result) => {
  const { beta, capmReturn, futureValue, initialInvestment, expectedMarketReturn, fundName, years } = result
  const insights = []

  // Time to Double
  if (capmReturn > 0) {
    const rawDouble = 72 / (capmReturn * 100)
    if (rawDouble <= 100) {
      insights.push({
        type: 'positive',
        label: 'Time to Double',
        text: `Your money doubles roughly every ${rawDouble.toFixed(1)} years at this rate`,
      })
    }
  }

  // Inflation Reality
  const realReturn = capmReturn - INFLATION_RATE
  if (realReturn > 0) {
    insights.push({
      type: realReturn > 0.02 ? 'positive' : 'neutral',
      label: 'After Inflation',
      text: `Your real annual return is ~${formatPercent(realReturn)} after accounting for ~3% inflation`,
    })
  } else {
    insights.push({
      type: 'caution',
      label: 'After Inflation',
      text: `This return may not keep up with inflation (~3% annually)`,
    })
  }

  // Return multiple
  const multiple = initialInvestment > 0 ? futureValue / initialInvestment : 0
  if (multiple >= 3) {
    insights.push({ type: 'positive', label: 'Return', text: `Investment projected to grow ${multiple.toFixed(1)}x` })
  } else if (multiple >= 2) {
    insights.push({ type: 'positive', label: 'Return', text: `Investment projected to grow ${multiple.toFixed(1)}x — more than doubles` })
  } else if (multiple >= 1.5) {
    insights.push({ type: 'neutral', label: 'Return', text: `Investment projected to grow ${multiple.toFixed(1)}x` })
  }

  // vs Market
  if (capmReturn > expectedMarketReturn) {
    insights.push({ type: 'positive', label: 'vs Market', text: 'CAPM return exceeds the fund\'s historical average' })
  } else if (capmReturn < expectedMarketReturn) {
    insights.push({ type: 'caution', label: 'vs Market', text: 'CAPM return is below the fund\'s historical average' })
  }

  const summary = `Based on CAPM, ${fundName} is projected to grow your ${formatCurrency(initialInvestment)} to ${formatCurrency(futureValue)} over ${years} years at ${formatPercent(capmReturn)} annually.`

  return { summary, insights }
}

export const generateComparisonInsights = (results) => {
  const entries = Object.entries(results)
  const insights = []

  // Best performer
  const best = entries.reduce((a, b) => (b[1].futureValue > a[1].futureValue ? b : a))
  insights.push({
    type: 'positive',
    label: 'Top Performer',
    text: `${best[1].fundName} has the highest projected future value at ${formatCurrency(best[1].futureValue)}`,
  })

  // Lowest risk
  const lowestBeta = entries.reduce((a, b) => (b[1].beta < a[1].beta ? b : a))
  insights.push({
    type: 'positive',
    label: 'Lowest Risk',
    text: `${lowestBeta[1].fundName} has the lowest beta (${formatDecimal(lowestBeta[1].beta, 2)}) — least volatile`,
  })

  // Best return
  const highestReturn = entries.reduce((a, b) => (b[1].capmReturn > a[1].capmReturn ? b : a))
  insights.push({
    type: 'positive',
    label: 'Best Return',
    text: `${highestReturn[1].fundName} leads with a CAPM return of ${formatPercent(highestReturn[1].capmReturn)}`,
  })

  // Spread
  const worst = entries.reduce((a, b) => (b[1].futureValue < a[1].futureValue ? b : a))
  const spread = best[1].futureValue - worst[1].futureValue
  if (spread > 0) {
    insights.push({
      type: 'neutral',
      label: 'Spread',
      text: `${formatCurrency(spread)} difference between best and worst projected outcome`,
    })
  }

  const summary = `Comparing ${entries.length} funds: ${best[1].fundName} leads in projected value while ${lowestBeta[1].fundName} offers the lowest volatility.`

  return { summary, insights }
}
