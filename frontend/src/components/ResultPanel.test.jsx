import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultPanel from './ResultPanel'

const sampleResult = {
  fundName: 'Vanguard 500 Index Fund',
  futureValue: 52345.67,
  initialInvestment: 10000,
  years: 10,
  capmReturn: 0.16658,
  expectedMarketReturn: 0.1553,
  riskFreeRate: 0.0425,
  beta: 1.1,
}

describe('ResultPanel', () => {
  it('shows empty state message when no results', () => {
    render(<ResultPanel results={{}} isCalculating={false} />)
    expect(screen.getByText(/Run a calculation/)).toBeInTheDocument()
  })

  it('shows calculating message when loading without results', () => {
    render(<ResultPanel results={{}} isCalculating={true} />)
    expect(screen.getByText(/Calculating projected outcomes/)).toBeInTheDocument()
  })

  it('renders single fund details with one result', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('Vanguard 500 Index Fund')).toBeInTheDocument()
    expect(screen.getByText('$52,345.67')).toBeInTheDocument()
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

  it('renders all four breakdown rows for single fund', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('CAPM Return')).toBeInTheDocument()
    expect(screen.getByText('Expected Market Return')).toBeInTheDocument()
    expect(screen.getByText('Risk-Free Rate')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows "Unknown Fund" when fundName is missing', () => {
    render(<ResultPanel results={{ VFIAX: { ...sampleResult, fundName: '' } }} isCalculating={false} />)
    expect(screen.getByText('Unknown Fund')).toBeInTheDocument()
  })

  it('shows Moderate risk label for beta 0.8-1.2', () => {
    render(<ResultPanel results={{ VFIAX: { ...sampleResult, beta: 1.0 } }} isCalculating={false} />)
    expect(screen.getByText(/1\.00 · Moderate/)).toBeInTheDocument()
  })

  it('shows Conservative risk label for beta < 0.8', () => {
    render(<ResultPanel results={{ VFIAX: { ...sampleResult, beta: 0.5 } }} isCalculating={false} />)
    expect(screen.getByText(/0\.50 · Conservative/)).toBeInTheDocument()
  })

  it('shows Aggressive risk label for beta > 1.2', () => {
    render(<ResultPanel results={{ VFIAX: { ...sampleResult, beta: 1.5 } }} isCalculating={false} />)
    expect(screen.getByText(/1\.50 · Aggressive/)).toBeInTheDocument()
  })
})
