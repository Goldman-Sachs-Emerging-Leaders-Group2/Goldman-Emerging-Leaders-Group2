import { useEffect, useState } from 'react'
import { getMutualFunds } from '../api/client'

export function useFundForm() {
  const [funds, setFunds] = useState([])
  const [form, setForm] = useState({ tickers: [], investment: '10000', years: '10' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoadingFunds, setIsLoadingFunds] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [monthlyContribution, setMonthlyContribution] = useState('0')
  const [riskTolerance, setRiskTolerance] = useState(5)
  const [formCollapsed, setFormCollapsed] = useState(false)
  const [customTickers, setCustomTickers] = useState([])

  useEffect(() => {
    const loadFunds = async () => {
      setIsLoadingFunds(true)
      setLoadError('')
      try {
        const data = await getMutualFunds()
        setFunds(data)
        if (data.length > 0) {
          setForm(prev => ({ ...prev, tickers: [data[0].ticker] }))
        }
      } catch (error) {
        setLoadError(error.message || 'Unable to load mutual funds.')
      } finally {
        setIsLoadingFunds(false)
      }
    }
    loadFunds()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    setFieldErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleToggleTicker = (ticker) => {
    setForm(prev => ({
      ...prev,
      tickers: prev.tickers.includes(ticker)
        ? prev.tickers.filter(t => t !== ticker)
        : [...prev.tickers, ticker],
    }))
    setFieldErrors(prev => ({ ...prev, tickers: '' }))
  }

  const handleAddCustomTicker = (ticker) => {
    const t = ticker.toUpperCase()
    if (customTickers.includes(t) || form.tickers.includes(t)) return
    setCustomTickers(prev => [...prev, t])
    handleToggleTicker(t)
  }

  const handleRemoveCustomTicker = (ticker) => {
    setCustomTickers(prev => prev.filter(t => t !== ticker))
    if (form.tickers.includes(ticker)) handleToggleTicker(ticker)
  }

  const handleGoalChange = (e) => {
    const val = e.target.value
    setGoalAmount(val === '' ? '' : String(Math.max(0, Number(val) || 0)))
  }

  const handleMonthlyChange = (e) => setMonthlyContribution(e.target.value)

  const handleRiskToleranceChange = (e) => setRiskTolerance(Number(e.target.value))

  const validateForm = () => {
    const errors = {}
    if (form.tickers.length === 0) errors.tickers = 'Please select at least one mutual fund.'
    const inv = Number(form.investment)
    if (!Number.isFinite(inv) || inv <= 0) errors.investment = 'Investment must be greater than 0.'
    const yrs = Number(form.years)
    if (!Number.isInteger(yrs) || yrs < 1 || yrs > 100) errors.years = 'Years must be between 1 and 100.'
    setFieldErrors(errors)
    return errors
  }

  const cleanupFailedTickers = (failedSet) => {
    setCustomTickers(prev => {
      const remaining = new Set(prev.filter(t => !failedSet.has(t)))
      // Use the fresh customTickers set to filter form tickers
      setForm(formPrev => ({
        ...formPrev,
        tickers: formPrev.tickers.filter(t => !failedSet.has(t) || !remaining.has(t)),
      }))
      return [...remaining]
    })
  }

  const populateFrom = (inv) => {
    setForm({
      tickers: [inv.ticker],
      investment: String(inv.initialInvestment),
      years: String(inv.years),
    })
    setMonthlyContribution(String(inv.monthlyContribution || 0))
    setGoalAmount('')
    setFormCollapsed(false)
  }

  return {
    funds, form, fieldErrors, isLoadingFunds, loadError,
    goalAmount, monthlyContribution, riskTolerance,
    formCollapsed, setFormCollapsed, customTickers,
    handleChange, handleToggleTicker,
    handleAddCustomTicker, handleRemoveCustomTicker,
    handleGoalChange, handleMonthlyChange, handleRiskToleranceChange,
    validateForm, cleanupFailedTickers, populateFrom,
  }
}
