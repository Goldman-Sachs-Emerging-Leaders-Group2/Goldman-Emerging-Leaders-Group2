import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormSummary from './FormSummary'

describe('FormSummary', () => {
  const defaultProps = {
    tickers: ['VFIAX', 'QQQ'],
    investment: '10000',
    monthlyContribution: '500',
    years: '10',
    goalAmount: '50000',
    riskTolerance: 7,
    onExpand: vi.fn(),
  }

  it('renders scenario details', () => {
    render(<FormSummary {...defaultProps} />)
    expect(screen.getByText('Scenario summary')).toBeInTheDocument()
    expect(screen.getByText('VFIAX')).toBeInTheDocument()
    expect(screen.getByText('QQQ')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
    expect(screen.getByText('$500')).toBeInTheDocument()
    expect(screen.getByText('10 years')).toBeInTheDocument()
  })

  it('renders edit scenario button', () => {
    render(<FormSummary {...defaultProps} />)
    expect(screen.getByRole('button', { name: /edit scenario/i })).toBeInTheDocument()
  })

  it('calls onExpand when the button is clicked', async () => {
    const onExpand = vi.fn()
    render(<FormSummary {...defaultProps} onExpand={onExpand} />)
    await userEvent.click(screen.getByRole('button', { name: /edit scenario/i }))
    expect(onExpand).toHaveBeenCalled()
  })
})
