import { formatCurrency } from './formatters'

const INFLATION_RATE = 0.03

export const generateNarrative = (result, goalAmount) => {
  const { fundName, initialInvestment, futureValue, capmReturn, years, monthlyContribution = 0, totalContributed } = result
  const total = totalContributed || initialInvestment
  const hasSIP = monthlyContribution > 0

  const rawDouble = capmReturn > 0 ? 72 / (capmReturn * 100) : null
  const timeToDouble = rawDouble && rawDouble <= 100 ? rawDouble.toFixed(1) : null
  const realValue = futureValue / Math.pow(1 + INFLATION_RATE, years)

  let text = hasSIP
    ? `Your ${formatCurrency(initialInvestment)} plus ${formatCurrency(monthlyContribution)}/month in ${fundName} could grow to ${formatCurrency(futureValue)} over ${years} years`
    : `Your ${formatCurrency(initialInvestment)} in ${fundName} could grow to ${formatCurrency(futureValue)} over ${years} years`

  if (timeToDouble) {
    text += ` — doubling roughly every ${timeToDouble} years`
  }
  text += `. After inflation, that's about ${formatCurrency(realValue)} in today's dollars.`

  // Goal analysis
  const goal = goalAmount ? Number(goalAmount) : null
  if (goal && goal > 0) {
    if (futureValue >= goal) {
      // Estimate when goal is reached
      if (capmReturn > 0 && total > 0) {
        const yearsToGoal = hasSIP
          ? years // approximate — SIP goal timing is complex
          : Math.log(goal / initialInvestment) / capmReturn
        if (yearsToGoal < years) {
          text += ` You'll reach your ${formatCurrency(goal)} goal in about ${yearsToGoal.toFixed(1)} years.`
        } else {
          text += ` You'll reach your ${formatCurrency(goal)} goal by year ${years}.`
        }
      }
    } else {
      text += ` Your projected ${formatCurrency(futureValue)} falls short of your ${formatCurrency(goal)} goal.`
    }
  }

  return text
}

export const generateComparisonNarrative = (results, goalAmount) => {
  const entries = Object.values(results)
  const best = entries.reduce((a, b) => (b.futureValue > a.futureValue ? b : a))
  const safest = entries.reduce((a, b) => (b.beta < a.beta ? b : a))

  const riskLabel = (beta) => beta < 0.8 ? 'low risk' : beta <= 1.2 ? 'moderate risk' : 'higher risk'

  let text = `${best.fundName} leads at ${formatCurrency(best.futureValue)}`
  if (best.beta > 1.2) {
    text += ` but carries ${riskLabel(best.beta)} (beta ${best.beta.toFixed(2)})`
  }
  if (safest.fundName !== best.fundName) {
    text += `. ${safest.fundName} offers a steadier path at ${formatCurrency(safest.futureValue)} with ${riskLabel(safest.beta)}.`
  } else {
    text += ` — and it's also the least volatile option.`
  }

  const goal = goalAmount ? Number(goalAmount) : null
  if (goal && goal > 0) {
    const reachGoal = entries.filter(r => r.futureValue >= goal)
    if (reachGoal.length === entries.length) {
      text += ` All ${entries.length} funds reach your ${formatCurrency(goal)} goal.`
    } else if (reachGoal.length > 0) {
      text += ` ${reachGoal.length} of ${entries.length} funds reach your ${formatCurrency(goal)} goal.`
    } else {
      text += ` None of the funds reach your ${formatCurrency(goal)} goal in this timeframe.`
    }
  }

  return text
}
