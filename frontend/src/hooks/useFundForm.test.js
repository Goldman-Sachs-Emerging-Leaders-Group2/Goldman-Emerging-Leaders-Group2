import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useFundForm } from './useFundForm'

vi.mock('../api/client', () => ({
  getMutualFunds: vi.fn(),
}))

import { getMutualFunds } from '../api/client'

const mockFunds = [
  { ticker: 'VFIAX', name: 'Vanguard 500', expectedAnnualReturn: 0.14 },
  { ticker: 'FXAIX', name: 'Fidelity 500', expectedAnnualReturn: 0.14 },
]

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('useFundForm', () => {
  it('loads funds on mount and selects first fund', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())

    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))
    expect(result.current.funds).toEqual(mockFunds)
    expect(result.current.form.tickers).toEqual(['VFIAX'])
  })

  it('sets loadError on fetch failure', async () => {
    getMutualFunds.mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useFundForm())

    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))
    expect(result.current.loadError).toBe('Network error')
  })

  it('handles form field changes', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.handleChange({ target: { name: 'investment', value: '5000' } }))
    expect(result.current.form.investment).toBe('5000')
  })

  it('toggles ticker selection', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.handleToggleTicker('FXAIX'))
    expect(result.current.form.tickers).toContain('FXAIX')

    act(() => result.current.handleToggleTicker('FXAIX'))
    expect(result.current.form.tickers).not.toContain('FXAIX')
  })

  it('validates empty tickers', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.handleToggleTicker('VFIAX')) // deselect
    let errors
    act(() => { errors = result.current.validateForm() })
    expect(errors.tickers).toBeDefined()
  })

  it('validates investment must be positive', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.handleChange({ target: { name: 'investment', value: '0' } }))
    let errors
    act(() => { errors = result.current.validateForm() })
    expect(errors.investment).toBeDefined()
  })

  it('populates form from saved investment', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.populateFrom({
      ticker: 'SPY',
      initialInvestment: 25000,
      years: 15,
      monthlyContribution: 500,
    }))
    expect(result.current.form.tickers).toEqual(['SPY'])
    expect(result.current.form.investment).toBe('25000')
    expect(result.current.form.years).toBe('15')
    expect(result.current.monthlyContribution).toBe('500')
    expect(result.current.formCollapsed).toBe(false)
  })

  it('adds and removes custom tickers', async () => {
    getMutualFunds.mockResolvedValue(mockFunds)
    const { result } = renderHook(() => useFundForm())
    await waitFor(() => expect(result.current.isLoadingFunds).toBe(false))

    act(() => result.current.handleAddCustomTicker('aapl'))
    expect(result.current.customTickers).toContain('AAPL')
    expect(result.current.form.tickers).toContain('AAPL')

    act(() => result.current.handleRemoveCustomTicker('AAPL'))
    expect(result.current.customTickers).not.toContain('AAPL')
  })
})
