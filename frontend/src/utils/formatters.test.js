import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPercent, formatDecimal } from './formatters'

describe('formatCurrency', () => {
  it('formats a positive number as USD', () => {
    expect(formatCurrency(10000)).toBe('$10,000.00')
  })

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('formats a negative number', () => {
    expect(formatCurrency(-500)).toBe('-$500.00')
  })

  it('formats null as zero (Number(null) === 0)', () => {
    expect(formatCurrency(null)).toBe('$0.00')
  })

  it('returns dash for undefined', () => {
    expect(formatCurrency(undefined)).toBe('—')
  })

  it('returns dash for NaN', () => {
    expect(formatCurrency(NaN)).toBe('—')
  })

  it('returns dash for Infinity', () => {
    expect(formatCurrency(Infinity)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('formats a decimal as percent', () => {
    expect(formatPercent(0.1553)).toBe('15.53%')
  })

  it('formats zero', () => {
    expect(formatPercent(0)).toBe('0.00%')
  })

  it('formats null as zero', () => {
    expect(formatPercent(null)).toBe('0.00%')
  })

  it('returns dash for NaN', () => {
    expect(formatPercent(NaN)).toBe('—')
  })
})

describe('formatDecimal', () => {
  it('formats to 2 decimal places by default', () => {
    expect(formatDecimal(1.156)).toBe('1.16')
  })

  it('formats to custom decimal places', () => {
    expect(formatDecimal(1.15678, 4)).toBe('1.1568')
  })

  it('formats null as zero', () => {
    expect(formatDecimal(null)).toBe('0.00')
  })

  it('returns dash for NaN', () => {
    expect(formatDecimal(NaN)).toBe('—')
  })
})
