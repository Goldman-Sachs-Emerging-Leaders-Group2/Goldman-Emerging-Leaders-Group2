import { describe, it, expect } from 'vitest'
import { generateProjectionData, generateMultiProjectionData } from './projection'

const sampleResult = {
  initialInvestment: 10000,
  capmReturn: 0.16658,
  years: 10,
  futureValue: 52345.67,
}

describe('generateProjectionData', () => {
  it('generates correct number of data points', () => {
    const data = generateProjectionData(sampleResult)
    expect(data).toHaveLength(11)
  })

  it('starts with initial investment at year 0', () => {
    const data = generateProjectionData(sampleResult)
    expect(data[0].year).toBe(0)
    expect(data[0].value).toBe(10000)
  })

  it('final year value matches exponential formula', () => {
    const data = generateProjectionData(sampleResult)
    const expected = 10000 * Math.exp(0.16658 * 10)
    expect(data[10].year).toBe(10)
    expect(data[10].value).toBeCloseTo(expected, 6)
  })

  it('all values are finite positive numbers', () => {
    const data = generateProjectionData(sampleResult)
    data.forEach((point) => {
      expect(Number.isFinite(point.value)).toBe(true)
      expect(point.value).toBeGreaterThan(0)
    })
  })

  it('values increase monotonically for positive capmReturn', () => {
    const data = generateProjectionData(sampleResult)
    for (let i = 1; i < data.length; i++) {
      expect(data[i].value).toBeGreaterThan(data[i - 1].value)
    }
  })
})

describe('generateMultiProjectionData', () => {
  const results = {
    VFIAX: { initialInvestment: 10000, capmReturn: 0.16, years: 5 },
    FXAIX: { initialInvestment: 10000, capmReturn: 0.12, years: 5 },
  }

  it('generates correct number of data points', () => {
    const data = generateMultiProjectionData(results)
    expect(data).toHaveLength(6) // years 0 through 5
  })

  it('each point has year and all tickers as keys', () => {
    const data = generateMultiProjectionData(results)
    expect(data[0]).toHaveProperty('year', 0)
    expect(data[0]).toHaveProperty('VFIAX')
    expect(data[0]).toHaveProperty('FXAIX')
  })

  it('year 0 values equal initial investment for all funds', () => {
    const data = generateMultiProjectionData(results)
    expect(data[0].VFIAX).toBe(10000)
    expect(data[0].FXAIX).toBe(10000)
  })

  it('higher capmReturn produces higher final value', () => {
    const data = generateMultiProjectionData(results)
    const last = data[data.length - 1]
    expect(last.VFIAX).toBeGreaterThan(last.FXAIX)
  })

  it('returns empty array for empty results', () => {
    expect(generateMultiProjectionData({})).toEqual([])
  })
})
