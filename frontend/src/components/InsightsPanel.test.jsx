import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import InsightsPanel from './InsightsPanel'

const sampleResult = {
  beta: 1.1,
  capmReturn: 0.16658,
  futureValue: 52345.67,
  initialInvestment: 10000,
  expectedMarketReturn: 0.1553,
  fundName: 'Vanguard 500 Index Fund',
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

  it('renders single-fund insights with one result', () => {
    render(<InsightsPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText(/Based on CAPM/)).toBeInTheDocument()
    expect(screen.getByText('Time to Double')).toBeInTheDocument()
    expect(screen.getByText('After Inflation')).toBeInTheDocument()
  })

  it('renders comparison insights with multiple results', () => {
    const results = {
      VFIAX: sampleResult,
      FXAIX: { ...sampleResult, fundName: 'Fidelity 500', futureValue: 48000, beta: 0.9 },
    }
    render(<InsightsPanel results={results} isCalculating={false} />)
    expect(screen.getByText(/Comparing 2 funds/)).toBeInTheDocument()
    expect(screen.getByText('Top Performer')).toBeInTheDocument()
    expect(screen.getByText('Lowest Risk')).toBeInTheDocument()
  })

  it('applies opacity when calculating with results', () => {
    render(<InsightsPanel results={{ VFIAX: sampleResult }} isCalculating={true} />)
    expect(screen.getByTestId('insights-content')).toHaveClass('opacity-50')
  })
})
