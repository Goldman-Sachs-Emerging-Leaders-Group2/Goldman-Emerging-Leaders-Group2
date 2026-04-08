import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultPanel from './ResultPanel'

const sampleResult = {
  ticker: 'VFIAX',
  fundName: 'Vanguard 500 Index Fund',
  futureValue: 52345.67,
  initialInvestment: 10000,
  totalContributed: 10000,
  years: 10,
  capmReturn: 0.16658,
  expectedMarketReturn: 0.1553,
  riskFreeRate: 0.0425,
  beta: 1.1,
}

describe('ResultPanel', () => {
  it('shows empty state message when no results', () => {
    render(<ResultPanel results={{}} isCalculating={false} />)
    expect(screen.getByText(/build a comparison to review projected values/i)).toBeInTheDocument()
  })

  it('shows calculating message when loading without results', () => {
    render(<ResultPanel results={{}} isCalculating={true} />)
    expect(screen.getByText(/building comparison details/i)).toBeInTheDocument()
  })

  it('renders single fund details with one result', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('Vanguard 500 Index Fund')).toBeInTheDocument()
    expect(screen.getAllByText('$52,345.67').length).toBeGreaterThanOrEqual(1)
  })

  it('renders comparison table with multiple results', () => {
    const results = {
      VFIAX: sampleResult,
      FXAIX: { ...sampleResult, fundName: 'Fidelity 500', ticker: 'FXAIX', futureValue: 48000 },
    }
    render(<ResultPanel results={results} isCalculating={false} />)
    expect(screen.getByText('VFIAX')).toBeInTheDocument()
    expect(screen.getByText('FXAIX')).toBeInTheDocument()
    expect(screen.getByTestId('comparison-table-scroll')).toBeInTheDocument()
  })

  it('renders the four detail rows for a single fund', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('Expected return (CAPM)')).toBeInTheDocument()
    expect(screen.getByText('Observed market return')).toBeInTheDocument()
    expect(screen.getByText('Treasury baseline')).toBeInTheDocument()
    expect(screen.getByText('Volatility vs. S&P 500')).toBeInTheDocument()
  })
})
