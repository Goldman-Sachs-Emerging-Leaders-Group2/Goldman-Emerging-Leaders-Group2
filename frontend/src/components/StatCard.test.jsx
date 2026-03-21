import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from './StatCard'

const baseProps = {
  label: 'Future Value',
  value: null,
  subText: null,
  indicatorColor: 'green',
  isLoading: false,
  hasError: false,
}

describe('StatCard', () => {
  it('shows empty state when value is null', () => {
    render(<StatCard {...baseProps} />)
    expect(screen.getByText('Future Value')).toBeInTheDocument()
    expect(screen.getByText('Awaiting calculation')).toBeInTheDocument()
  })

  it('shows loading state with skeleton', () => {
    const { container } = render(<StatCard {...baseProps} isLoading={true} />)
    expect(container.querySelector('.stat-card-skeleton')).toBeInTheDocument()
    expect(screen.getByText(/Calculating/)).toBeInTheDocument()
    expect(container.querySelector('.stat-card')).toHaveClass('loading')
  })

  it('shows error state', () => {
    const { container } = render(<StatCard {...baseProps} hasError={true} />)
    expect(screen.getByText('Calculation failed')).toBeInTheDocument()
    expect(container.querySelector('.stat-card')).toHaveClass('error')
  })

  it('shows formatted value and subText', () => {
    render(
      <StatCard
        {...baseProps}
        value="$52,345.67"
        subText="$10,000 invested over 10 yrs"
      />,
    )
    expect(screen.getByText('$52,345.67')).toBeInTheDocument()
    expect(screen.getByText('$10,000 invested over 10 yrs')).toBeInTheDocument()
  })

  it('applies correct indicator color class', () => {
    const { container } = render(<StatCard {...baseProps} indicatorColor="amber" />)
    expect(container.querySelector('.stat-card-indicator')).toHaveClass('amber')
  })
})
