import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewState } from './useViewState'

describe('useViewState', () => {
  it('starts in entry mode with results view', () => {
    const { result } = renderHook(() => useViewState())
    expect(result.current.dashboardMode).toBe(false)
    expect(result.current.activeView).toBe('results')
  })

  it('enters dashboard mode with specified view', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.enterDashboard('history'))
    expect(result.current.dashboardMode).toBe(true)
    expect(result.current.activeView).toBe('history')
  })

  it('defaults to results view when entering dashboard', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.enterDashboard())
    expect(result.current.activeView).toBe('results')
  })

  it('navigates between views', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.enterDashboard())

    act(() => result.current.navigateTo('history'))
    expect(result.current.activeView).toBe('history')

    act(() => result.current.navigateTo('results'))
    expect(result.current.activeView).toBe('results')
  })

  it('exits dashboard mode and resets to results', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.enterDashboard('history'))
    act(() => result.current.exitDashboard())
    expect(result.current.dashboardMode).toBe(false)
    expect(result.current.activeView).toBe('results')
  })
})
