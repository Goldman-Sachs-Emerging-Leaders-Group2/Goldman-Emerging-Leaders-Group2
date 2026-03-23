import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

const fundsResponse = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund', expectedAnnualReturn: 0.1553 },
  { ticker: 'FXAIX', name: 'Fidelity 500 Index Fund', expectedAnnualReturn: 0.1556 },
]

const calculationResponse = {
  ticker: 'VFIAX',
  fundName: 'Vanguard 500 Index Fund',
  initialInvestment: 10000,
  years: 10,
  beta: 1.1,
  riskFreeRate: 0.0425,
  expectedMarketReturn: 0.1553,
  capmReturn: 0.16658,
  futureValue: 52345.67,
  monthlyContribution: 0,
  totalContributed: 10000,
}

function mockFetch(fundsResult, calcResults) {
  return vi.fn((url) => {
    if (typeof url === 'string' && url.includes('/api/mutualfunds')) {
      if (fundsResult instanceof Error) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: fundsResult.message }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(fundsResult),
      })
    }
    if (typeof url === 'string' && url.includes('/api/calculate')) {
      // Extract ticker from URL
      const params = new URLSearchParams(url.split('?')[1])
      const ticker = params.get('ticker')
      const result = calcResults instanceof Error ? calcResults : (calcResults[ticker] || calcResults)

      if (result instanceof Error) {
        return Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ message: result.message }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(result),
      })
    }
    return Promise.reject(new Error('Unknown URL'))
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  // --- Load behavior ---

  it('populates fund checkboxes after loading', async () => {
    globalThis.fetch = mockFetch(fundsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
      expect(screen.getByText(/FXAIX/)).toBeInTheDocument()
    })
  })

  it('shows error banner when fund loading fails', async () => {
    globalThis.fetch = mockFetch(new Error('Network down'), calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Network down')).toBeInTheDocument()
    })
  })

  it('shows warning when API returns empty fund array', async () => {
    globalThis.fetch = mockFetch([], calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('No funds available')).toBeInTheDocument()
    })
  })

  // --- Form validation ---

  it('shows error when no funds selected', async () => {
    globalThis.fetch = mockFetch(fundsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    })

    // Uncheck the default selected fund
    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0]) // uncheck VFIAX

    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))

    expect(screen.getByText('Please select at least one mutual fund.')).toBeInTheDocument()
  })

  it('shows error when investment is zero', async () => {
    globalThis.fetch = mockFetch(fundsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    })

    const investmentInput = screen.getByLabelText('Initial Investment ($)')
    await userEvent.clear(investmentInput)
    await userEvent.type(investmentInput, '0')
    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))

    expect(screen.getByText('Investment must be greater than 0.')).toBeInTheDocument()
  })

  // --- Successful calculation ---

  it('renders results after single-fund calculation', async () => {
    globalThis.fetch = mockFetch(fundsResponse, { VFIAX: calculationResponse })
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))

    await waitFor(() => {
      expect(screen.getAllByText('Vanguard 500 Index Fund').length).toBeGreaterThanOrEqual(1)
    })

    expect(screen.getAllByText('$52,345.67').length).toBeGreaterThanOrEqual(1)
  })

  // --- Error states ---

  it('shows error banner when all calculations fail', async () => {
    globalThis.fetch = mockFetch(fundsResponse, new Error('External API failed'))
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/VFIAX/)).toBeInTheDocument()
    })

    await userEvent.click(screen.getByRole('button', { name: /calculate future value/i }))

    await waitFor(() => {
      expect(screen.getByText('External API failed')).toBeInTheDocument()
    })
  })
})
