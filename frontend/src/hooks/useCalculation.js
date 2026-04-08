import { useMemo, useState } from 'react'
import { calculateMultipleFunds } from '../api/client'
import { generateNarrative, generateComparisonNarrative } from '../utils/narrative'

const REQUIRED_FIELDS = [
  'ticker', 'futureValue', 'capmReturn', 'expectedMarketReturn',
  'beta', 'fundName', 'years', 'initialInvestment', 'riskFreeRate', 'totalContributed',
]

export function useCalculation() {
  const [results, setResults] = useState({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState('')
  const [lastCalculatedForm, setLastCalculatedForm] = useState(null)

  const resultTickers = Object.keys(results)
  const resultCount = resultTickers.length
  const hasResults = resultCount > 0
  const isMulti = resultCount > 1
  const primaryResult = hasResults ? results[resultTickers[0]] : null

  const bestResult = useMemo(() => {
    if (!hasResults) return null
    if (!isMulti) return primaryResult
    return Object.values(results).reduce((best, r) => r.futureValue > best.futureValue ? r : best)
  }, [results, hasResults, isMulti, primaryResult])

  const bestCapmResult = useMemo(() => {
    if (!hasResults) return null
    return Object.values(results).reduce((best, r) => r.capmReturn > best.capmReturn ? r : best)
  }, [results, hasResults])

  const isStale = (form, monthlyContribution = 0) => {
    if (!hasResults || !lastCalculatedForm) return false
    return (
      JSON.stringify([...form.tickers].sort()) !== JSON.stringify(lastCalculatedForm.tickers) ||
      Number(form.investment) !== lastCalculatedForm.investment ||
      Number(form.years) !== lastCalculatedForm.years ||
      Number(monthlyContribution) !== lastCalculatedForm.monthlyContribution
    )
  }

  const getNarrative = (goalAmount, riskTolerance) => {
    if (!hasResults) return null
    if (isMulti) return generateComparisonNarrative(results, goalAmount, riskTolerance)
    return generateNarrative(primaryResult, goalAmount, riskTolerance)
  }

  const calculate = async (form, monthlyContribution, customTickers, onFailedTickers) => {
    setCalculationError('')
    setIsCalculating(true)

    try {
      const { results: newResults, errors: apiErrors } = await calculateMultipleFunds({
        tickers: form.tickers,
        investment: Number(form.investment),
        years: Number(form.years),
        monthlyContribution: Number(monthlyContribution) || 0,
      })

      for (const [ticker, response] of Object.entries(newResults)) {
        const missing = REQUIRED_FIELDS.filter(f => response[f] == null)
        if (missing.length > 0) {
          delete newResults[ticker]
          apiErrors[ticker] = 'Received incomplete data from the server.'
        }
      }

      if (Object.keys(newResults).length === 0) {
        throw new Error(Object.values(apiErrors)[0] || 'All calculations failed.')
      }

      setResults(newResults)

      if (Object.keys(apiErrors).length > 0) {
        const failedList = Object.entries(apiErrors)
          .map(([t, msg]) => `${t}: ${msg.includes('beta') || msg.includes('reach') ? 'ticker not found or unavailable' : msg}`)
          .join('; ')
        setCalculationError(failedList)
        onFailedTickers?.(new Set(Object.keys(apiErrors)))
      }

      setLastCalculatedForm({
        tickers: [...form.tickers].sort(),
        investment: Number(form.investment),
        years: Number(form.years),
        monthlyContribution: Number(monthlyContribution) || 0,
      })

      return true
    } catch (error) {
      setCalculationError(error.message || 'Unable to calculate future value.')
      return false
    } finally {
      setIsCalculating(false)
    }
  }

  const reset = () => {
    setResults({})
    setLastCalculatedForm(null)
    setCalculationError('')
  }

  const loadSavedResult = (investment) => {
    const normalizedResult = {
      ticker: investment.ticker,
      fundName: investment.fundName,
      initialInvestment: investment.initialInvestment,
      monthlyContribution: investment.monthlyContribution || 0,
      years: investment.years,
      futureValue: investment.futureValue,
      capmReturn: investment.capmReturn,
      beta: investment.beta,
      totalContributed: investment.totalContributed,
      riskFreeRate: investment.riskFreeRate,
      expectedMarketReturn: investment.expectedMarketReturn,
    }

    setResults({ [investment.ticker]: normalizedResult })
    setLastCalculatedForm({
      tickers: [investment.ticker],
      investment: Number(investment.initialInvestment),
      years: Number(investment.years),
      monthlyContribution: Number(investment.monthlyContribution) || 0,
    })
    setCalculationError('')
  }

  return {
    results, isCalculating, calculationError, setCalculationError,
    resultTickers, resultCount, hasResults, isMulti, primaryResult,
    bestResult, bestCapmResult,
    isStale, getNarrative, calculate, reset, loadSavedResult,
  }
}
