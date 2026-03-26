import { describe, it, expect } from 'vitest'
import { generateInsights, generateComparisonInsights } from './insights'

const baseResult = {
  beta: 1.1,
  capmReturn: 0.16658,
  futureValue: 52345.67,
  initialInvestment: 10000,
  expectedMarketReturn: 0.1553,
  assetName: 'Vanguard 500 Index Fund',
  assetType: 'MUTUAL_FUND',
  years: 10,
  riskFreeRate: 0.0425,
}

describe('generateInsights', () => {
  it('returns summary and insights array', () => {
    const { summary, insights } = generateInsights(baseResult)
    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
    expect(Array.isArray(insights)).toBe(true)
    expect(insights.length).toBeGreaterThanOrEqual(2)
  })

  it('summary includes asset name', () => {
    const { summary } = generateInsights(baseResult)
    expect(summary).toContain('Vanguard 500 Index Fund')
  })

  it('beta > 1 produces caution volatility insight', () => {
    const { insights } = generateInsights({ ...baseResult, beta: 1.3 })
    const vol = insights.find((i) => i.label === 'Volatility')
    expect(vol.type).toBe('caution')
    expect(vol.text).toContain('Higher volatility')
  })

  it('beta < 1 produces positive volatility insight', () => {
    const { insights } = generateInsights({ ...baseResult, beta: 0.7 })
    const vol = insights.find((i) => i.label === 'Volatility')
    expect(vol.type).toBe('positive')
    expect(vol.text).toContain('Lower volatility')
  })

  it('beta near 1 produces neutral volatility insight', () => {
    const { insights } = generateInsights({ ...baseResult, beta: 1.02 })
    const vol = insights.find((i) => i.label === 'Volatility')
    expect(vol.type).toBe('neutral')
  })

  it('high capmReturn produces strong growth insight', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: 0.15 })
    const growth = insights.find((i) => i.label === 'Growth')
    expect(growth.type).toBe('positive')
    expect(growth.text).toContain('Strong')
  })

  it('capmReturn > expectedMarketReturn produces positive vs Market', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: 0.20, expectedMarketReturn: 0.15 })
    const vs = insights.find((i) => i.label === 'vs Market')
    expect(vs.type).toBe('positive')
  })

  it('capmReturn < expectedMarketReturn produces caution vs Market', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: 0.10, expectedMarketReturn: 0.15 })
    const vs = insights.find((i) => i.label === 'vs Market')
    expect(vs.type).toBe('caution')
  })

  it('triple or more return produces positive Return insight', () => {
    const { insights } = generateInsights({ ...baseResult, futureValue: 35000, initialInvestment: 10000 })
    const ret = insights.find((i) => i.label === 'Return')
    expect(ret.type).toBe('positive')
  })
})

describe('generateComparisonInsights', () => {
  const results = {
    VFIAX: baseResult,
    SPY: { ...baseResult, assetName: 'SPDR S&P 500 ETF', assetType: 'ETF', futureValue: 48000, beta: 0.9, capmReturn: 0.14 },
  }

  it('returns summary and insights', () => {
    const { summary, insights } = generateComparisonInsights(results)
    expect(summary).toContain('Comparing 2 assets')
    expect(insights.length).toBeGreaterThanOrEqual(3)
  })

  it('identifies top performer', () => {
    const { insights } = generateComparisonInsights(results)
    const top = insights.find((i) => i.label === 'Top Performer')
    expect(top.text).toContain('Vanguard 500')
  })

  it('identifies lowest risk asset', () => {
    const { insights } = generateComparisonInsights(results)
    const low = insights.find((i) => i.label === 'Lowest Risk')
    expect(low.text).toContain('SPDR S&P 500 ETF')
    expect(low.text).toContain('0.90')
  })

  it('shows spread between best and worst', () => {
    const { insights } = generateComparisonInsights(results)
    const spread = insights.find((i) => i.label === 'Spread')
    expect(spread).toBeDefined()
    expect(spread.text).toContain('difference')
  })
})
