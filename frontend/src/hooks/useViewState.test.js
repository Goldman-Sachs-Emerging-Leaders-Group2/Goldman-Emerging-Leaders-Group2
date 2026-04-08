import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useViewState } from './useViewState'

describe('useViewState', () => {
  it('starts on the home view', () => {
    const { result } = renderHook(() => useViewState())
    expect(result.current.dashboardMode).toBe(false)
    expect(result.current.activeView).toBe('home')
  })

  it('moves to plan view when startPlan is called', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.startPlan())
    expect(result.current.activeView).toBe('plan')
  })

  it('moves to results view when showResults is called', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.showResults())
    expect(result.current.activeView).toBe('results')
  })

  it('navigates to saved and learn views', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.navigateTo('saved'))
    expect(result.current.activeView).toBe('saved')
    act(() => result.current.navigateTo('learn'))
    expect(result.current.activeView).toBe('learn')
  })

  it('returns home with goHome', () => {
    const { result } = renderHook(() => useViewState())
    act(() => result.current.showResults())
    act(() => result.current.goHome())
    expect(result.current.dashboardMode).toBe(false)
    expect(result.current.activeView).toBe('home')
  })
})
