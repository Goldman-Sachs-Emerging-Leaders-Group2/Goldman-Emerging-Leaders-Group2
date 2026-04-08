import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryStats from './SummaryStats'

describe('SummaryStats', () => {
  const defaultProps = {
    bestResult: { futureValue: 45000, fundName: 'Vanguard 500 Index Fund' },
    bestCapmResult: { capmReturn: 0.1525, fundName: 'T. Rowe Price Blue Chip' },
    resultCount: 3,
  }

  it('renders all three stat cards', () => {
    render(<SummaryStats {...defaultProps} />)
    expect(screen.getByText('Projected leader')).toBeInTheDocument()
    expect(screen.getByText('Highest CAPM signal')).toBeInTheDocument()
    expect(screen.getByText('Funds in scope')).toBeInTheDocument()
  })

  it('renders the values', () => {
    render(<SummaryStats {...defaultProps} />)
    expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    expect(screen.getByText('15.25%')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows fund names and comparison subtitle', () => {
    render(<SummaryStats {...defaultProps} />)
    expect(screen.getByText('Vanguard 500 Index Fund')).toBeInTheDocument()
    expect(screen.getByText('T. Rowe Price Blue Chip')).toBeInTheDocument()
    expect(screen.getByText('Side-by-side comparison')).toBeInTheDocument()
  })
})
