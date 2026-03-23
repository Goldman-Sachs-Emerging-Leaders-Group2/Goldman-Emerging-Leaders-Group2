import { describe, it, expect } from 'vitest'
import { generateInsights, generateComparisonInsights } from './insights'

const baseResult = {
  beta: 1.1,
  capmReturn: 0.16658,
  futureValue: 52345.67,
  initialInvestment: 10000,
  expectedMarketReturn: 0.1553,
  fundName: 'Vanguard 500 Index Fund',
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

  it('summary includes fund name', () => {
    const { summary } = generateInsights(baseResult)
    expect(summary).toContain('Vanguard 500 Index Fund')
  })

  it('produces time to double insight', () => {
    const { insights } = generateInsights(baseResult)
    const ttd = insights.find((i) => i.label === 'Time to Double')
    expect(ttd).toBeDefined()
    expect(ttd.type).toBe('positive')
    expect(ttd.text).toContain('doubles')
  })

  it('produces after inflation insight', () => {
    const { insights } = generateInsights(baseResult)
    const inf = insights.find((i) => i.label === 'After Inflation')
    expect(inf).toBeDefined()
    expect(inf.text).toContain('inflation')
  })

  it('caution when return may not beat inflation', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: 0.02 })
    const inf = insights.find((i) => i.label === 'After Inflation')
    expect(inf.type).toBe('caution')
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

  it('handles zero capmReturn gracefully', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: 0 })
    const ttd = insights.find((i) => i.label === 'Time to Double')
    expect(ttd).toBeUndefined() // can't double with 0% return
  })

  it('handles negative capmReturn gracefully', () => {
    const { insights } = generateInsights({ ...baseResult, capmReturn: -0.05 })
    const inf = insights.find((i) => i.label === 'After Inflation')
    expect(inf.type).toBe('caution')
  })
})

describe('generateComparisonInsights', () => {
  const results = {
    VFIAX: baseResult,
    FXAIX: { ...baseResult, fundName: 'Fidelity 500', futureValue: 48000, beta: 0.9, capmReturn: 0.14 },
  }

  it('returns summary and insights', () => {
    const { summary, insights } = generateComparisonInsights(results)
    expect(summary).toContain('Comparing 2 funds')
    expect(insights.length).toBeGreaterThanOrEqual(3)
  })

  it('identifies top performer', () => {
    const { insights } = generateComparisonInsights(results)
    const top = insights.find((i) => i.label === 'Top Performer')
    expect(top.text).toContain('Vanguard 500')
  })

  it('identifies lowest risk fund', () => {
    const { insights } = generateComparisonInsights(results)
    const low = insights.find((i) => i.label === 'Lowest Risk')
    expect(low.text).toContain('Fidelity 500')
    expect(low.text).toContain('0.90')
  })

  it('shows spread between best and worst', () => {
    const { insights } = generateComparisonInsights(results)
    const spread = insights.find((i) => i.label === 'Spread')
    expect(spread).toBeDefined()
    expect(spread.text).toContain('difference')
  })
})
