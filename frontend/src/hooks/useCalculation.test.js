import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCalculation } from './useCalculation'

vi.mock('../api/client', () => ({
  calculateMultipleFunds: vi.fn(),
}))

vi.mock('../utils/narrative', () => ({
  generateNarrative: vi.fn(() => 'Single fund narrative'),
  generateComparisonNarrative: vi.fn(() => 'Comparison narrative'),
}))

import { calculateMultipleFunds } from '../api/client'

const mockResult = {
  ticker: 'VFIAX', fundName: 'Vanguard 500', initialInvestment: 10000,
  years: 10, beta: 1.1, riskFreeRate: 0.0425, expectedMarketReturn: 0.142,
  capmReturn: 0.15, futureValue: 45000, monthlyContribution: 0, totalContributed: 10000,
}

beforeEach(() => vi.restoreAllMocks())

describe('useCalculation', () => {
  it('starts with empty results', () => {
    const { result } = renderHook(() => useCalculation())
    expect(result.current.hasResults).toBe(false)
    expect(result.current.resultCount).toBe(0)
  })

  it('calculates successfully and sets results', async () => {
    calculateMultipleFunds.mockResolvedValue({ results: { VFIAX: mockResult }, errors: {} })

    const { result } = renderHook(() => useCalculation())
    let success
    await act(async () => {
      success = await result.current.calculate(
        { tickers: ['VFIAX'], investment: '10000', years: '10' }, '0', []
      )
    })
    expect(success).toBe(true)
    expect(result.current.hasResults).toBe(true)
    expect(result.current.resultCount).toBe(1)
    expect(result.current.bestResult.ticker).toBe('VFIAX')
  })

  it('handles calculation failure', async () => {
    calculateMultipleFunds.mockResolvedValue({
      results: {},
      errors: { VFIAX: 'API error' },
    })

    const { result } = renderHook(() => useCalculation())
    let success
    await act(async () => {
      success = await result.current.calculate(
        { tickers: ['VFIAX'], investment: '10000', years: '10' }, '0', []
      )
    })
    expect(success).toBe(false)
    expect(result.current.calculationError).toContain('API error')
  })

  it('resets state', async () => {
    calculateMultipleFunds.mockResolvedValue({ results: { VFIAX: mockResult }, errors: {} })
    const { result } = renderHook(() => useCalculation())

    await act(async () => {
      await result.current.calculate({ tickers: ['VFIAX'], investment: '10000', years: '10' }, '0', [])
    })
    expect(result.current.hasResults).toBe(true)

    act(() => result.current.reset())
    expect(result.current.hasResults).toBe(false)
    expect(result.current.calculationError).toBe('')
  })

  it('detects stale form', async () => {
    calculateMultipleFunds.mockResolvedValue({ results: { VFIAX: mockResult }, errors: {} })
    const { result } = renderHook(() => useCalculation())

    await act(async () => {
      await result.current.calculate({ tickers: ['VFIAX'], investment: '10000', years: '10' }, '0', [])
    })

    expect(result.current.isStale({ tickers: ['VFIAX'], investment: '10000', years: '10' })).toBe(false)
    expect(result.current.isStale({ tickers: ['VFIAX'], investment: '20000', years: '10' })).toBe(true)
  })

  it('generates narrative for results', async () => {
    calculateMultipleFunds.mockResolvedValue({ results: { VFIAX: mockResult }, errors: {} })
    const { result } = renderHook(() => useCalculation())

    await act(async () => {
      await result.current.calculate({ tickers: ['VFIAX'], investment: '10000', years: '10' }, '0', [])
    })

    const narrative = result.current.getNarrative('', 5)
    expect(narrative).toBe('Single fund narrative')
  })
})
