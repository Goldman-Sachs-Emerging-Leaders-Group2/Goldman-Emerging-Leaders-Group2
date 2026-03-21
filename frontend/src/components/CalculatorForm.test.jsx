import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorForm from './CalculatorForm'

const funds = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund', expectedAnnualReturn: 0.1553 },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', expectedAnnualReturn: 0.1556 },
]

const defaultProps = {
  funds,
  form: { tickers: ['VFIAX'], investment: '10000', years: '10' },
  errors: {},
  onChange: vi.fn(),
  onToggleTicker: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  isCalculating: false,
  isLoadingFunds: false,
  riskFreeRate: null,
}

describe('CalculatorForm', () => {
  it('renders fund checkboxes from props', () => {
    render(<CalculatorForm {...defaultProps} />)
    expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    expect(screen.getByText(/FXAIX/)).toBeInTheDocument()
  })

  it('shows "No funds available" when funds array is empty', () => {
    render(<CalculatorForm {...defaultProps} funds={[]} />)
    expect(screen.getByText('No funds available')).toBeInTheDocument()
  })

  it('disables checkboxes when loading funds', () => {
    render(<CalculatorForm {...defaultProps} isLoadingFunds={true} />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).toBeDisabled())
  })

  it('disables inputs when calculating', () => {
    render(<CalculatorForm {...defaultProps} isCalculating={true} />)
    expect(screen.getByLabelText('Investment ($)')).toBeDisabled()
    expect(screen.getByLabelText('Terms (Years)')).toBeDisabled()
  })

  it('disables submit button when calculating', () => {
    render(<CalculatorForm {...defaultProps} isCalculating={true} />)
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
  })

  it('disables submit button when no funds', () => {
    render(<CalculatorForm {...defaultProps} funds={[]} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows field error messages', () => {
    render(
      <CalculatorForm
        {...defaultProps}
        errors={{ investment: 'Investment must be greater than 0.' }}
      />,
    )
    expect(screen.getByText('Investment must be greater than 0.')).toBeInTheDocument()
  })

  it('shows "Calculating…" button text when calculating', () => {
    render(<CalculatorForm {...defaultProps} isCalculating={true} />)
    expect(screen.getByRole('button', { name: /calculating/i })).toBeInTheDocument()
  })

  it('displays formatted risk-free rate when provided', () => {
    render(<CalculatorForm {...defaultProps} riskFreeRate={0.0425} />)
    expect(screen.getByLabelText('Risk-free rate from last calculation')).toHaveValue('4.25%')
  })

  it('calls onToggleTicker when checkbox clicked', async () => {
    const onToggleTicker = vi.fn()
    render(<CalculatorForm {...defaultProps} onToggleTicker={onToggleTicker} />)
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[1]) // click FXAIX
    expect(onToggleTicker).toHaveBeenCalledWith('FXAIX')
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<CalculatorForm {...defaultProps} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))
    expect(onSubmit).toHaveBeenCalled()
  })
})
