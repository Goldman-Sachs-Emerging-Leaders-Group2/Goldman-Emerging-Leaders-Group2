import { formatCurrency, formatDecimal, formatPercent } from './formatters'

export const generateInsights = (result) => {
  const { beta, capmReturn, futureValue, initialInvestment, expectedMarketReturn, assetName, years } = result
  const insights = []

  // Volatility
  if (Math.abs(beta - 1) <= 0.05) {
    insights.push({ type: 'neutral', label: 'Volatility', text: 'Moves roughly in line with the market' })
  } else if (beta < 1) {
    insights.push({ type: 'positive', label: 'Volatility', text: 'Lower volatility than the overall market' })
  } else {
    insights.push({ type: 'caution', label: 'Volatility', text: 'Higher volatility than the overall market' })
  }

  // Growth
  if (capmReturn > 0.12) {
    insights.push({ type: 'positive', label: 'Growth', text: 'Strong expected annual growth' })
  } else if (capmReturn > 0.05) {
    insights.push({ type: 'neutral', label: 'Growth', text: 'Moderate expected annual growth' })
  } else {
    insights.push({ type: 'caution', label: 'Growth', text: 'Conservative expected growth' })
  }

  // Return multiple
  const multiple = futureValue / initialInvestment
  if (multiple >= 3) {
    insights.push({ type: 'positive', label: 'Return', text: 'Investment projected to triple or more' })
  } else if (multiple >= 2) {
    insights.push({ type: 'neutral', label: 'Return', text: 'Investment projected to double or more' })
  }

  // vs Market
  if (capmReturn > expectedMarketReturn) {
    insights.push({ type: 'positive', label: 'vs Market', text: 'CAPM return exceeds market average' })
  } else if (capmReturn < expectedMarketReturn) {
    insights.push({ type: 'caution', label: 'vs Market', text: 'CAPM return below market average' })
  }

  const summary = `Based on CAPM, ${assetName} with a beta of ${formatDecimal(beta, 2)} is projected to grow your ${formatCurrency(initialInvestment)} to ${formatCurrency(futureValue)} over ${years} years at ${formatPercent(capmReturn)} annually.`

  return { summary, insights }
}

export const generateComparisonInsights = (results) => {
  const entries = Object.entries(results)
  const insights = []

  const best = entries.reduce((a, b) => (b[1].futureValue > a[1].futureValue ? b : a))
  insights.push({
    type: 'positive',
    label: 'Top Performer',
    text: `${best[1].assetName} has the highest projected future value at ${formatCurrency(best[1].futureValue)}`,
  })

  const lowestBeta = entries.reduce((a, b) => (b[1].beta < a[1].beta ? b : a))
  insights.push({
    type: 'positive',
    label: 'Lowest Risk',
    text: `${lowestBeta[1].assetName} has the lowest beta (${formatDecimal(lowestBeta[1].beta, 2)}) — least volatile`,
  })

  const highestReturn = entries.reduce((a, b) => (b[1].capmReturn > a[1].capmReturn ? b : a))
  insights.push({
    type: 'positive',
    label: 'Best Return',
    text: `${highestReturn[1].assetName} leads with a CAPM return of ${formatPercent(highestReturn[1].capmReturn)}`,
  })

  const worst = entries.reduce((a, b) => (b[1].futureValue < a[1].futureValue ? b : a))
  const spread = best[1].futureValue - worst[1].futureValue
  if (spread > 0) {
    insights.push({
      type: 'neutral',
      label: 'Spread',
      text: `${formatCurrency(spread)} difference between best and worst projected outcome`,
    })
  }

  const summary = `Comparing ${entries.length} assets: ${best[1].assetName} leads in projected value while ${lowestBeta[1].assetName} offers the lowest volatility.`

  return { summary, insights }
}
