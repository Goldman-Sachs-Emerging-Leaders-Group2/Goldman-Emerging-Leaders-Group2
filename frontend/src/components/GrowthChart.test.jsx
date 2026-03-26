import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import GrowthChart from './GrowthChart'

const sampleResult = {
  initialInvestment: 10000,
  capmReturn: 0.16658,
  years: 10,
  futureValue: 52345.67,
  assetName: 'Vanguard 500 Index Fund',
  assetType: 'MUTUAL_FUND',
  expectedMarketReturn: 0.1553,
  riskFreeRate: 0.0425,
  beta: 1.1,
}

describe('GrowthChart', () => {
  it('shows empty state when no results', () => {
    render(<GrowthChart results={{}} isCalculating={false} />)
    expect(screen.getByText(/Run a calculation to see projected growth/)).toBeInTheDocument()
  })

  it('shows calculating message when loading without results', () => {
    render(<GrowthChart results={{}} isCalculating={true} />)
    expect(screen.getByText(/Calculating projection/)).toBeInTheDocument()
  })

  it('renders chart container with single result', () => {
    const { container } = render(<GrowthChart results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(container.querySelector('.chart-container')).toBeInTheDocument()
    expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
  })

  it('applies updating class when calculating with results', () => {
    const { container } = render(<GrowthChart results={{ VFIAX: sampleResult }} isCalculating={true} />)
    expect(container.querySelector('.chart-container')).toHaveClass('updating')
  })
})
