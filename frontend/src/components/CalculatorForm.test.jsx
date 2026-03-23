import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorForm from './CalculatorForm'

const funds = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund', expectedAnnualReturn: 0.1420 },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', expectedAnnualReturn: 0.1420 },
  { ticker: 'AGTHX', name: 'American Funds Growth', expectedAnnualReturn: 0.2509 },
  { ticker: 'FCNTX', name: 'Fidelity Contrafund', expectedAnnualReturn: 0.2061 },
  { ticker: 'TRBCX', name: 'T. Rowe Price Blue Chip', expectedAnnualReturn: 0.1666 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', expectedAnnualReturn: 0.1636 },
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
  goalAmount: '',
  onGoalChange: vi.fn(),
  monthlyContribution: '0',
  onMonthlyChange: vi.fn(),
  riskTolerance: 5,
  onRiskToleranceChange: vi.fn(),
}

describe('CalculatorForm', () => {
  it('renders fund cards from props', () => {
    render(<CalculatorForm {...defaultProps} />)
    expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    expect(screen.getByText(/FXAIX/)).toBeInTheDocument()
  })

  it('shows "No funds available" when funds array is empty', () => {
    render(<CalculatorForm {...defaultProps} funds={[]} />)
    expect(screen.getByText('No funds available')).toBeInTheDocument()
  })

  it('shows "Loading funds…" when loading with empty funds', () => {
    render(<CalculatorForm {...defaultProps} funds={[]} isLoadingFunds={true} />)
    expect(screen.getByText('Loading funds…')).toBeInTheDocument()
  })

  it('disables checkboxes when loading funds', () => {
    render(<CalculatorForm {...defaultProps} isLoadingFunds={true} />)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).toBeDisabled())
  })

  it('disables inputs when calculating', () => {
    render(<CalculatorForm {...defaultProps} isCalculating={true} />)
    expect(screen.getByLabelText('Initial Investment ($)')).toBeDisabled()
    expect(screen.getByLabelText('Investment Duration')).toBeDisabled()
  })

  it('disables submit button when calculating', () => {
    render(<CalculatorForm {...defaultProps} isCalculating={true} />)
    expect(screen.getByRole('button', { name: /calculating/i })).toBeDisabled()
  })

  it('disables submit button when no funds', () => {
    render(<CalculatorForm {...defaultProps} funds={[]} />)
    expect(screen.getByRole('button', { name: /calculate/i })).toBeDisabled()
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

  it('renders monthly contribution input', () => {
    render(<CalculatorForm {...defaultProps} monthlyContribution="500" />)
    expect(screen.getByLabelText(/Monthly Contribution/)).toHaveValue(500)
  })

  it('renders risk tolerance slider', () => {
    render(<CalculatorForm {...defaultProps} riskTolerance={7} />)
    expect(screen.getByText(/7\/10/)).toBeInTheDocument()
    expect(screen.getByText(/Aggressive/)).toBeInTheDocument()
  })

  it('calls onToggleTicker when fund card clicked', async () => {
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

  it('renders goal amount input', () => {
    render(<CalculatorForm {...defaultProps} goalAmount="50000" />)
    expect(screen.getByLabelText(/Goal Amount/)).toHaveValue(50000)
  })

  it('enforces MAX_SELECTIONS limit', () => {
    // Select all 5 mutual funds (visible on default tab) + 1 ETF
    const maxForm = { tickers: ['VFIAX', 'FXAIX', 'AGTHX', 'FCNTX', 'TRBCX'], investment: '10000', years: '10' }
    render(<CalculatorForm {...defaultProps} form={maxForm} />)
    // With 5 selected, no remaining unchecked mutual fund checkboxes should exist
    // All 5 are checked, so all should be enabled (to allow deselecting)
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach((cb) => expect(cb).not.toBeDisabled())
  })
})
