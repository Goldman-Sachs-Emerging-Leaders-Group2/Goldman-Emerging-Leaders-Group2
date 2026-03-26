import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultPanel from './ResultPanel'

const sampleResult = {
  assetName: 'Vanguard 500 Index Fund',
  assetType: 'MUTUAL_FUND',
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

  it('renders single asset details with one result', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('Vanguard 500 Index Fund')).toBeInTheDocument()
    expect(screen.getByText('$52,345.67')).toBeInTheDocument()
  })

  it('renders comparison table with multiple results', () => {
    const results = {
      VFIAX: sampleResult,
      SPY: { ...sampleResult, assetName: 'SPDR S&P 500 ETF', assetType: 'ETF', ticker: 'SPY', futureValue: 48000 },
    }
    render(<ResultPanel results={results} isCalculating={false} />)
    expect(screen.getByText('VFIAX')).toBeInTheDocument()
    expect(screen.getByText('SPY')).toBeInTheDocument()
  })

  it('renders all four breakdown rows for single asset', () => {
    render(<ResultPanel results={{ VFIAX: sampleResult }} isCalculating={false} />)
    expect(screen.getByText('CAPM Return')).toBeInTheDocument()
    expect(screen.getByText('Expected Market Return')).toBeInTheDocument()
    expect(screen.getByText('Risk-Free Rate')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('shows "Unknown Asset" when assetName is missing', () => {
    render(<ResultPanel results={{ VFIAX: { ...sampleResult, assetName: '' } }} isCalculating={false} />)
    expect(screen.getByText('Unknown Asset')).toBeInTheDocument()
  })
})
