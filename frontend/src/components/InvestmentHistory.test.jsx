import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvestmentHistory from './InvestmentHistory'

// AG Grid needs a container with dimensions
const renderWithContainer = (ui) => {
  return render(<div style={{ width: '800px', height: '600px' }}>{ui}</div>)
}

const sampleInvestment = {
  id: 1,
  label: 'Retirement',
  ticker: 'VFIAX',
  fundName: 'Vanguard 500 Index Fund',
  initialInvestment: 10000,
  monthlyContribution: 500,
  years: 10,
  futureValue: 46012.34,
  capmReturn: 0.15248,
  beta: 1.1,
  totalContributed: 70000,
  riskFreeRate: 0.0425,
  expectedMarketReturn: 0.142,
  savedAt: new Date().toISOString(),
}

describe('InvestmentHistory', () => {
  const defaultProps = {
    investments: [],
    onDelete: vi.fn(),
    onRerun: vi.fn(),
    isLoading: false,
  }

  it('shows loading state', () => {
    renderWithContainer(<InvestmentHistory {...defaultProps} isLoading={true} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('shows empty state when no investments', () => {
    renderWithContainer(<InvestmentHistory {...defaultProps} />)
    expect(screen.getByText(/no saved investments/i)).toBeInTheDocument()
  })

  it('renders AG Grid when investments exist', () => {
    renderWithContainer(
      <InvestmentHistory {...defaultProps} investments={[sampleInvestment]} />
    )
    // AG Grid should render the container
    expect(document.querySelector('.ag-theme-quartz')).toBeInTheDocument()
  })

  it('does not show empty state when investments exist', () => {
    renderWithContainer(
      <InvestmentHistory {...defaultProps} investments={[sampleInvestment]} />
    )
    expect(screen.queryByText(/no saved investments/i)).not.toBeInTheDocument()
  })
})
