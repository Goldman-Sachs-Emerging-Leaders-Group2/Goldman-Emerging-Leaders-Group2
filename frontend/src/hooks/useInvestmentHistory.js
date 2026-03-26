import { useEffect, useState } from 'react'
import { getInvestments, saveInvestment, deleteInvestment as deleteInvestmentApi } from '../api/client'

export function useInvestmentHistory(onError) {
  const [savedInvestments, setSavedInvestments] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [saveLabel, setSaveLabel] = useState('')
  const [saveStatus, setSaveStatus] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoadingHistory(true)
      try {
        const data = await getInvestments()
        setSavedInvestments(data)
      } catch {
        // Silent fail — history is non-critical
      } finally {
        setIsLoadingHistory(false)
      }
    }
    loadHistory()
  }, [])

  const saveResults = async (results) => {
    const entries = Object.values(results)
    if (entries.length === 0) return

    setSaveStatus('saving')
    try {
      const saved = await Promise.all(
        entries.map(r => saveInvestment({
          label: saveLabel || null,
          ticker: r.ticker,
          fundName: r.fundName,
          initialInvestment: r.initialInvestment,
          monthlyContribution: r.monthlyContribution,
          years: r.years,
          futureValue: r.futureValue,
          capmReturn: r.capmReturn,
          beta: r.beta,
          totalContributed: r.totalContributed,
          riskFreeRate: r.riskFreeRate,
          expectedMarketReturn: r.expectedMarketReturn,
        }))
      )
      setSavedInvestments(prev => [...saved, ...prev])
      setSaveLabel('')
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (error) {
      onError?.('Failed to save: ' + error.message)
      setSaveStatus(null)
    }
  }

  const removeInvestment = async (id) => {
    try {
      await deleteInvestmentApi(id)
      setSavedInvestments(prev => prev.filter(inv => inv.id !== id))
    } catch (error) {
      onError?.('Failed to delete: ' + error.message)
    }
  }

  return {
    savedInvestments, isLoadingHistory, saveLabel, setSaveLabel, saveStatus,
    saveResults, removeInvestment,
  }
}
