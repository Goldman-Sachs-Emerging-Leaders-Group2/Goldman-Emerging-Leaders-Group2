import { formatCurrency, formatDecimal, formatPercent } from './formatters'
import { isRiskMatch, isTooConservative, getComfortLabel } from './riskMatch'

const INFLATION_RATE = 0.03

export const generateInsights = (result, riskTolerance) => {
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

  // Return multiple (based on total contributed, not just initial)
  const totalIn = result.totalContributed || initialInvestment
  const multiple = totalIn > 0 ? futureValue / totalIn : 0
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

  // Risk match
  if (riskTolerance != null) {
    const label = getComfortLabel(riskTolerance)
    if (isTooConservative(beta, riskTolerance)) {
      insights.push({ type: 'neutral', label: 'Risk Match', text: `This fund may be too conservative for your ${label.toLowerCase()} appetite — steadier but potentially lower returns` })
    } else if (isRiskMatch(beta, riskTolerance)) {
      insights.push({ type: 'positive', label: 'Risk Match', text: `Good fit — this fund's volatility matches your ${label.toLowerCase()} risk comfort` })
    } else {
      insights.push({ type: 'caution', label: 'Risk Match', text: `Heads up — this fund swings more than your ${label.toLowerCase()} comfort zone suggests` })
    }
  }

  const summary = `Based on CAPM, ${fundName} is projected to grow your ${formatCurrency(initialInvestment)} to ${formatCurrency(futureValue)} over ${years} years at ${formatPercent(capmReturn)} annually.`

  return { summary, insights }
}

export const generateComparisonInsights = (results, riskTolerance) => {
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

  // Risk match
  if (riskTolerance != null) {
    const label = getComfortLabel(riskTolerance)
    const matches = entries.filter(([, r]) => isRiskMatch(r.beta, riskTolerance))
    const mismatches = entries.filter(([, r]) => !isRiskMatch(r.beta, riskTolerance))
    if (mismatches.length === 0) {
      insights.push({ type: 'positive', label: 'Risk Match', text: `All ${entries.length} funds match your ${label.toLowerCase()} risk profile` })
    } else {
      const names = mismatches.map(([, r]) => r.fundName).join(', ')
      insights.push({ type: 'caution', label: 'Risk Match', text: `${names} may be too volatile for your ${label.toLowerCase()} preference` })
    }
  }

  const summary = `Comparing ${entries.length} funds: ${best[1].fundName} leads in projected value while ${lowestBeta[1].fundName} offers the lowest volatility.`

  return { summary, insights }
}
