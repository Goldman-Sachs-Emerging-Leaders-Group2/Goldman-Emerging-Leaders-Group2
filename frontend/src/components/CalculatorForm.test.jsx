import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorForm from './CalculatorForm'

const assets = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund', type: 'MUTUAL_FUND', expectedAnnualReturn: 0.1553 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', expectedAnnualReturn: 0.1548 },
]

const defaultProps = {
  assets,
  form: { tickers: ['VFIAX'], investment: '10000', years: '10' },
  errors: {},
  onChange: vi.fn(),
  onToggleTicker: vi.fn(),
  onSubmit: vi.fn((e) => e.preventDefault()),
  isCalculating: false,
  isLoadingAssets: false,
  riskFreeRate: null,
}

describe('CalculatorForm', () => {
  it('renders asset checkboxes from props', () => {
    render(<CalculatorForm {...defaultProps} />)
    expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    expect(screen.getByText(/SPY/)).toBeInTheDocument()
  })

  it('shows asset type badges', () => {
    render(<CalculatorForm {...defaultProps} />)
    expect(screen.getByText('MF')).toBeInTheDocument()
    expect(screen.getByText('ETF')).toBeInTheDocument()
  })

  it('shows "No assets available" when assets array is empty', () => {
    render(<CalculatorForm {...defaultProps} assets={[]} />)
    expect(screen.getByText('No assets available')).toBeInTheDocument()
  })

  it('disables checkboxes when loading assets', () => {
    render(<CalculatorForm {...defaultProps} isLoadingAssets={true} />)
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

  it('disables submit button when no assets', () => {
    render(<CalculatorForm {...defaultProps} assets={[]} />)
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

  it('displays formatted risk-free rate when provided', () => {
    render(<CalculatorForm {...defaultProps} riskFreeRate={0.0425} />)
    expect(screen.getByLabelText('Risk-free rate from last calculation')).toHaveValue('4.25%')
  })

  it('calls onToggleTicker when checkbox clicked', async () => {
    const onToggleTicker = vi.fn()
    render(<CalculatorForm {...defaultProps} onToggleTicker={onToggleTicker} />)
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[1]) // click SPY
    expect(onToggleTicker).toHaveBeenCalledWith('SPY')
  })

  it('calls onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(<CalculatorForm {...defaultProps} onSubmit={onSubmit} />)
    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))
    expect(onSubmit).toHaveBeenCalled()
  })
})
