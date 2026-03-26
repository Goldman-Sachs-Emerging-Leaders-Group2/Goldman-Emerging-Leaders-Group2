import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormSummary from './FormSummary'

describe('FormSummary', () => {
  const defaultProps = {
    tickers: ['VFIAX', 'QQQ'],
    investment: '10000',
    years: '10',
    onExpand: vi.fn(),
  }

  it('renders ticker names, investment, and years', () => {
    render(<FormSummary {...defaultProps} />)
    expect(screen.getByText('VFIAX, QQQ')).toBeInTheDocument()
    expect(screen.getByText('$10,000')).toBeInTheDocument()
    expect(screen.getByText('10 years')).toBeInTheDocument()
  })

  it('renders Modify button', () => {
    render(<FormSummary {...defaultProps} />)
    expect(screen.getByText('Modify')).toBeInTheDocument()
  })

  it('calls onExpand when clicked', async () => {
    const onExpand = vi.fn()
    render(<FormSummary {...defaultProps} onExpand={onExpand} />)
    await userEvent.click(screen.getByText('Modify'))
    expect(onExpand).toHaveBeenCalled()
  })
})
