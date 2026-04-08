import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GrowthChart from './GrowthChart'

const sampleResult = {
  initialInvestment: 10000,
  totalContributed: 10000,
  capmReturn: 0.16658,
  years: 10,
  futureValue: 52345.67,
  fundName: 'Vanguard 500 Index Fund',
  expectedMarketReturn: 0.1553,
  riskFreeRate: 0.0425,
  beta: 1.1,
}

describe('GrowthChart', () => {
  it('shows empty state when no results', () => {
    render(<GrowthChart results={{}} isCalculating={false} />)
    expect(screen.getByText(/build a comparison to see how each scenario compounds over time/i)).toBeInTheDocument()
  })

  it('shows calculating message when loading without results', () => {
    render(<GrowthChart results={{}} isCalculating={true} />)
    expect(screen.getByText(/building growth path/i)).toBeInTheDocument()
  })

  it('renders chart container with a single result', () => {
    render(<GrowthChart results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
  })

  it('applies opacity when calculating with results', () => {
    render(<GrowthChart results={{ VFIAX: sampleResult }} isCalculating={true} />)
    expect(screen.getByTestId('chart-container').className).toContain('opacity-50')
  })
})
