import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { calculateMultipleAssets, getAssets } from '../api/client'

const AppContext = createContext(null)

const REQUIRED_FIELDS = ['futureValue', 'capmReturn', 'expectedMarketReturn', 'beta', 'assetName', 'years', 'initialInvestment', 'riskFreeRate']
const MAX_NOTIFICATIONS = 20

let notificationId = 0

export const AppProvider = ({ children }) => {
  const [assets, setAssets] = useState([])
  const [form, setForm] = useState({
    tickers: [],
    investment: '10000',
    years: '10',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [results, setResults] = useState({})
  const [lastCalculatedForm, setLastCalculatedForm] = useState(null)
  const [isLoadingAssets, setIsLoadingAssets] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [calculationError, setCalculationError] = useState('')
  const [notifications, setNotifications] = useState([])
  const [history, setHistory] = useState([])

  const prevStaleRef = useRef(false)

  const resultTickers = Object.keys(results)
  const resultCount = resultTickers.length
  const hasResults = resultCount > 0
  const isMulti = resultCount > 1
  const primaryResult = hasResults ? results[resultTickers[0]] : null

  const bestResult = useMemo(() => {
    if (!hasResults) return null
    if (!isMulti) return primaryResult
    return Object.values(results).reduce((best, r) =>
      r.futureValue > best.futureValue ? r : best,
    )
  }, [results, hasResults, isMulti, primaryResult])

  const addNotification = useCallback((type, message) => {
    setNotifications((prev) => {
      const next = [{ id: ++notificationId, type, message, timestamp: Date.now(), read: false }, ...prev]
      return next.slice(0, MAX_NOTIFICATIONS)
    })
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications])

  useEffect(() => {
    const loadAssets = async () => {
      setIsLoadingAssets(true)
      setLoadError('')

      try {
        const data = await getAssets()
        setAssets(data)

        if (data.length > 0) {
          setForm((previous) => ({
            ...previous,
            tickers: [data[0].ticker],
          }))
        }
      } catch (error) {
        setLoadError(error.message || 'Unable to load assets.')
      } finally {
        setIsLoadingAssets(false)
      }
    }

    loadAssets()
  }, [])

  const validateForm = useCallback(() => {
    const errors = {}

    if (form.tickers.length === 0) {
      errors.tickers = 'Please select at least one asset.'
    }

    const parsedInvestment = Number(form.investment)
    if (!Number.isFinite(parsedInvestment) || parsedInvestment <= 0) {
      errors.investment = 'Investment must be greater than 0.'
    }

    const parsedYears = Number(form.years)
    if (!Number.isInteger(parsedYears) || parsedYears < 0 || parsedYears > 100) {
      errors.years = 'Years must be an integer from 0 to 100.'
    }

    return errors
  }, [form])

  const handleChange = useCallback((event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }))

    setFieldErrors((previous) => ({
      ...previous,
      [name]: '',
    }))
    setCalculationError('')
  }, [])

  const handleToggleTicker = useCallback((ticker) => {
    setForm((previous) => {
      const exists = previous.tickers.includes(ticker)
      return {
        ...previous,
        tickers: exists
          ? previous.tickers.filter((t) => t !== ticker)
          : [...previous.tickers, ticker],
      }
    })

    setFieldErrors((previous) => ({ ...previous, tickers: '' }))
    setCalculationError('')
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()

    const errors = validateForm()
    setFieldErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    setCalculationError('')
    setIsCalculating(true)

    try {
      const { results: newResults, errors: apiErrors } = await calculateMultipleAssets({
        tickers: form.tickers,
        investment: Number(form.investment),
        years: Number(form.years),
      })

      for (const [ticker, response] of Object.entries(newResults)) {
        const missing = REQUIRED_FIELDS.filter((f) => response[f] == null)
        if (missing.length > 0) {
          delete newResults[ticker]
          apiErrors[ticker] = 'Received incomplete data from the server.'
        }
      }

      if (Object.keys(newResults).length === 0) {
        const firstError = Object.values(apiErrors)[0] || 'All calculations failed.'
        throw new Error(firstError)
      }

      setResults(newResults)

      setHistory((prev) => [
        {
          id: Date.now(),
          timestamp: Date.now(),
          form: {
            tickers: [...form.tickers],
            investment: Number(form.investment),
            years: Number(form.years),
          },
          results: { ...newResults },
        },
        ...prev,
      ].slice(0, 50))

      const successTickers = Object.keys(newResults).join(', ')
      addNotification('success', `Calculation complete for ${successTickers}`)

      if (Object.keys(apiErrors).length > 0) {
        const failedTickers = Object.keys(apiErrors).join(', ')
        setCalculationError(`Some assets failed: ${failedTickers}`)
        addNotification('warning', `Some assets failed: ${failedTickers}`)
      }

      setLastCalculatedForm({
        tickers: [...form.tickers].sort(),
        investment: Number(form.investment),
        years: Number(form.years),
      })
    } catch (error) {
      setCalculationError(error.message || 'Unable to calculate future value.')
      addNotification('error', error.message || 'Calculation failed.')
    } finally {
      setIsCalculating(false)
    }
  }, [form, validateForm, addNotification])

  const isStale = useMemo(() => {
    if (!hasResults || !lastCalculatedForm) {
      return false
    }

    return (
      JSON.stringify([...form.tickers].sort()) !== JSON.stringify(lastCalculatedForm.tickers) ||
      Number(form.investment) !== lastCalculatedForm.investment ||
      Number(form.years) !== lastCalculatedForm.years
    )
  }, [form, lastCalculatedForm, hasResults])

  // Fire stale notification only on transition from not-stale to stale
  useEffect(() => {
    if (isStale && !prevStaleRef.current) {
      addNotification('info', 'Results are stale — form values changed since last calculation.')
    }
    prevStaleRef.current = isStale
  }, [isStale, addNotification])

  const statusMessage = useMemo(() => {
    if (loadError) {
      return { type: 'error', message: loadError }
    }

    if (calculationError) {
      return { type: 'error', message: calculationError }
    }

    if (isLoadingAssets) {
      return { type: 'info', message: 'Loading asset universe…' }
    }

    if (assets.length === 0) {
      return { type: 'warning', message: 'No assets are currently available.' }
    }

    return null
  }, [loadError, calculationError, isLoadingAssets, assets.length])

  const riskFreeRate = primaryResult?.riskFreeRate ?? null

  const clearHistory = useCallback(() => setHistory([]), [])

  const clearResults = useCallback(() => {
    setResults({})
    setLastCalculatedForm(null)
    setCalculationError('')
  }, [])

  const value = {
    assets,
    form,
    fieldErrors,
    results,
    resultTickers,
    resultCount,
    hasResults,
    isMulti,
    primaryResult,
    bestResult,
    isLoadingAssets,
    isCalculating,
    calculationError,
    isStale,
    statusMessage,
    riskFreeRate,
    notifications,
    unreadCount,
    handleChange,
    handleToggleTicker,
    handleSubmit,
    clearResults,
    history,
    clearHistory,
    addNotification,
    markAllRead,
    clearNotifications,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return context
}
