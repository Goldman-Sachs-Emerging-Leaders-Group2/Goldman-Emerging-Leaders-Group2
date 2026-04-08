import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InvestmentHistory from './InvestmentHistory'

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
    render(<InvestmentHistory {...defaultProps} isLoading={true} />)
    expect(screen.getByText(/loading saved scenarios/i)).toBeInTheDocument()
  })

  it('shows empty state when no investments', () => {
    render(<InvestmentHistory {...defaultProps} />)
    expect(screen.getByText(/no saved scenarios yet/i)).toBeInTheDocument()
  })

  it('renders card details for an investment', () => {
    render(<InvestmentHistory {...defaultProps} investments={[sampleInvestment]} />)
    expect(screen.getByText(/VFIAX · Vanguard 500 Index Fund/)).toBeInTheDocument()
    expect(screen.getByText('Retirement')).toBeInTheDocument()
    expect(screen.getAllByText('$10,000.00').length).toBeGreaterThan(0)
  })

  it('renders action buttons', () => {
    render(<InvestmentHistory {...defaultProps} investments={[sampleInvestment]} />)
    expect(screen.getByTitle('Open in results')).toBeInTheDocument()
    expect(screen.getByTitle('Delete scenario')).toBeInTheDocument()
  })

  it('calls onRerun when open in results is clicked', async () => {
    const onRerun = vi.fn()
    render(<InvestmentHistory {...defaultProps} investments={[sampleInvestment]} onRerun={onRerun} />)
    await userEvent.click(screen.getByTitle('Open in results'))
    expect(onRerun).toHaveBeenCalledWith(sampleInvestment)
  })

  it('shows delete confirmation on first click', async () => {
    render(<InvestmentHistory {...defaultProps} investments={[sampleInvestment]} />)
    await userEvent.click(screen.getByTitle('Delete scenario'))
    expect(screen.getByText('Confirm delete')).toBeInTheDocument()
  })
})
