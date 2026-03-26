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
    expect(screen.getByText('Best Future Value')).toBeInTheDocument()
    expect(screen.getByText('Best CAPM Return')).toBeInTheDocument()
    expect(screen.getByText('Funds Compared')).toBeInTheDocument()
  })

  it('displays formatted values', () => {
    render(<SummaryStats {...defaultProps} />)
    expect(screen.getByText('$45,000.00')).toBeInTheDocument()
    expect(screen.getByText('15.25%')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows fund names as subtitles', () => {
    render(<SummaryStats {...defaultProps} />)
    expect(screen.getByText('Vanguard 500 Index Fund')).toBeInTheDocument()
    expect(screen.getByText('T. Rowe Price Blue Chip')).toBeInTheDocument()
    expect(screen.getByText('multi-fund comparison')).toBeInTheDocument()
  })
})
