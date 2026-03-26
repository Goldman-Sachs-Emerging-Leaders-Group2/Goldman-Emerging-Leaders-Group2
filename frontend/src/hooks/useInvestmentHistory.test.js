import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useInvestmentHistory } from './useInvestmentHistory'

vi.mock('../api/client', () => ({
  getInvestments: vi.fn(),
  saveInvestment: vi.fn(),
  deleteInvestment: vi.fn(),
}))

import { getInvestments, saveInvestment, deleteInvestment } from '../api/client'

const mockSaved = { id: 1, ticker: 'VFIAX', futureValue: 45000, savedAt: '2026-03-25T12:00:00' }

beforeEach(() => vi.restoreAllMocks())

describe('useInvestmentHistory', () => {
  it('loads saved investments on mount', async () => {
    getInvestments.mockResolvedValue([mockSaved])
    const { result } = renderHook(() => useInvestmentHistory())

    await waitFor(() => expect(result.current.isLoadingHistory).toBe(false))
    expect(result.current.savedInvestments).toEqual([mockSaved])
  })

  it('handles load failure silently', async () => {
    getInvestments.mockRejectedValue(new Error('DB error'))
    const { result } = renderHook(() => useInvestmentHistory())

    await waitFor(() => expect(result.current.isLoadingHistory).toBe(false))
    expect(result.current.savedInvestments).toEqual([])
  })

  it('saves results and prepends to list', async () => {
    getInvestments.mockResolvedValue([])
    const savedResult = { ...mockSaved, id: 2 }
    saveInvestment.mockResolvedValue(savedResult)

    const { result } = renderHook(() => useInvestmentHistory())
    await waitFor(() => expect(result.current.isLoadingHistory).toBe(false))

    await act(async () => {
      await result.current.saveResults({ VFIAX: { ticker: 'VFIAX', fundName: 'Vanguard 500', initialInvestment: 10000, monthlyContribution: 0, years: 10, futureValue: 45000, capmReturn: 0.15, beta: 1.1, totalContributed: 10000, riskFreeRate: 0.0425, expectedMarketReturn: 0.142 } })
    })

    expect(result.current.savedInvestments).toHaveLength(1)
    expect(result.current.saveStatus).toBe('saved')
  })

  it('removes investment by id', async () => {
    getInvestments.mockResolvedValue([mockSaved])
    deleteInvestment.mockResolvedValue()

    const { result } = renderHook(() => useInvestmentHistory())
    await waitFor(() => expect(result.current.savedInvestments).toHaveLength(1))

    await act(async () => {
      await result.current.removeInvestment(1)
    })

    expect(result.current.savedInvestments).toHaveLength(0)
  })

  it('calls onError when save fails', async () => {
    getInvestments.mockResolvedValue([])
    saveInvestment.mockRejectedValue(new Error('Save failed'))
    const onError = vi.fn()

    const { result } = renderHook(() => useInvestmentHistory(onError))
    await waitFor(() => expect(result.current.isLoadingHistory).toBe(false))

    await act(async () => {
      await result.current.saveResults({ VFIAX: { ticker: 'VFIAX', fundName: 'V', initialInvestment: 10000, monthlyContribution: 0, years: 10, futureValue: 45000, capmReturn: 0.15, beta: 1.1, totalContributed: 10000, riskFreeRate: 0.04, expectedMarketReturn: 0.14 } })
    })

    expect(onError).toHaveBeenCalledWith(expect.stringContaining('Save failed'))
  })
})
