import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LearnPanel from './LearnPanel'

describe('LearnPanel', () => {
  it('renders the teaching view and handles zeroed growth inputs without breaking the chart', async () => {
    render(<LearnPanel onStartPlan={vi.fn()} />)

    expect(screen.getByRole('heading', { name: /learn the building blocks behind a sound comparison/i })).toBeInTheDocument()

    const startingAmount = screen.getByLabelText('Starting amount')
    const monthlyContribution = screen.getByLabelText('Monthly contribution')

    fireEvent.change(startingAmount, { target: { value: '0' } })
    fireEvent.change(monthlyContribution, { target: { value: '0' } })

    expect(screen.getAllByText('$0.00').length).toBeGreaterThan(0)
    expect(screen.getByLabelText('Compound growth chart')).toBeInTheDocument()
    expect(screen.getByText(/projection window: year 0 to year 10/i)).toBeInTheDocument()
  })
})
