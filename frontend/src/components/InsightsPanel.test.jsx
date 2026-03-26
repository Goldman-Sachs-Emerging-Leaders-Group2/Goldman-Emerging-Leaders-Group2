import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightsPanel from './InsightsPanel'

const sampleResult = {
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

describe('InsightsPanel', () => {
  it('shows empty state when no results', () => {
    render(<InsightsPanel results={{}} isCalculating={false} />)
    expect(screen.getByText(/Run a calculation to see insights/)).toBeInTheDocument()
  })

  it('shows calculating message when loading without results', () => {
    render(<InsightsPanel results={{}} isCalculating={true} />)
    expect(screen.getByText(/Generating insights/)).toBeInTheDocument()
  })

  it('renders single-asset insights with one result', () => {
    render(<InsightsPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText(/Based on CAPM/)).toBeInTheDocument()
    expect(screen.getByText('Volatility')).toBeInTheDocument()
    expect(screen.getByText('Growth')).toBeInTheDocument()
  })

  it('renders comparison insights with multiple results', () => {
    const results = {
      VFIAX: sampleResult,
      SPY: { ...sampleResult, assetName: 'SPDR S&P 500 ETF', assetType: 'ETF', futureValue: 48000, beta: 0.9 },
    }
    render(<InsightsPanel results={results} isCalculating={false} />)
    expect(screen.getByText(/Comparing 2 assets/)).toBeInTheDocument()
    expect(screen.getByText('Top Performer')).toBeInTheDocument()
    expect(screen.getByText('Lowest Risk')).toBeInTheDocument()
  })

  it('applies updating class when calculating with results', () => {
    const { container } = render(<InsightsPanel results={{ VFIAX: sampleResult }} isCalculating={true} />)
    expect(container.querySelector('.insights-content')).toHaveClass('updating')
  })
})
