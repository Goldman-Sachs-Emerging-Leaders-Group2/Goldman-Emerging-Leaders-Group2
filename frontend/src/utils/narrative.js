import { formatCurrency, formatDecimal, formatPercent } from './formatters'

const INFLATION_RATE = 0.03

const riskLabel = (beta) => {
  if (beta < 0.8) return 'low risk'
  if (beta <= 1.2) return 'moderate risk'
  return 'higher risk'
}

export const generateNarrative = (result) => {
  const { fundName, initialInvestment, futureValue, capmReturn, beta, years } = result
  const timeToDouble = capmReturn > 0 ? (72 / (capmReturn * 100)).toFixed(1) : null
  const realValue = futureValue / Math.pow(1 + INFLATION_RATE, years)

  let text = `Your ${formatCurrency(initialInvestment)} in ${fundName} could grow to ${formatCurrency(futureValue)} over ${years} years`
  if (timeToDouble) {
    text += ` — doubling roughly every ${timeToDouble} years`
  }
  text += `. After inflation, that's about ${formatCurrency(realValue)} in today's dollars.`
  return text
}

export const generateComparisonNarrative = (results) => {
  const entries = Object.values(results)
  const best = entries.reduce((a, b) => (b.futureValue > a.futureValue ? b : a))
  const safest = entries.reduce((a, b) => (b.beta < a.beta ? b : a))

  let text = `${best.fundName} leads at ${formatCurrency(best.futureValue)}`
  if (best.beta > 1.2) {
    text += ` but carries ${riskLabel(best.beta)} (beta ${formatDecimal(best.beta, 2)})`
  }
  if (safest.fundName !== best.fundName) {
    text += `. ${safest.fundName} offers a steadier path at ${formatCurrency(safest.futureValue)} with ${riskLabel(safest.beta)}.`
  } else {
    text += ` — and it's also the least volatile option.`
  }
  return text
}
