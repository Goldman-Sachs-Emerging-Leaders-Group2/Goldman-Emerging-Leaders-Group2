import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

const assetsResponse = [
  { ticker: 'VFIAX', name: 'Vanguard 500 Index Fund', type: 'MUTUAL_FUND', expectedAnnualReturn: 0.1553 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'ETF', expectedAnnualReturn: 0.1548 },
]

const calculationResponse = {
  ticker: 'VFIAX',
  assetName: 'Vanguard 500 Index Fund',
  assetType: 'MUTUAL_FUND',
  initialInvestment: 10000,
  years: 10,
  beta: 1.1,
  riskFreeRate: 0.0425,
  expectedMarketReturn: 0.1553,
  capmReturn: 0.16658,
  futureValue: 52345.67,
}

function mockFetch(assetsResult, calcResults) {
  return vi.fn((url) => {
    if (typeof url === 'string' && url.includes('/api/assets')) {
      if (assetsResult instanceof Error) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ message: assetsResult.message }),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(assetsResult),
      })
    }
    if (typeof url === 'string' && url.includes('/api/calculate')) {
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

// App uses BrowserRouter internally, but tests need MemoryRouter.
// We'll render the inner content by testing individual views instead.
// For the full App, we just verify it renders without crashing.

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('App', () => {
  it('renders dashboard view by default', async () => {
    globalThis.fetch = mockFetch(assetsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Investment Overview')).toBeInTheDocument()
    })
  })

  it('shows error banner when asset loading fails', async () => {
    globalThis.fetch = mockFetch(new Error('Network down'), calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Network down')).toBeInTheDocument()
    })
  })

  it('shows "Go to Calculator" CTA when no results', async () => {
    globalThis.fetch = mockFetch(assetsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Go to Calculator')).toBeInTheDocument()
    })
  })

  it('navigates to calculator view', async () => {
    globalThis.fetch = mockFetch(assetsResponse, calculationResponse)
    render(<App />)

    await waitFor(() => {
      expect(screen.getByText('Investment Overview')).toBeInTheDocument()
    })

    const navLinks = screen.getAllByRole('link', { name: /calculator/i })
    await userEvent.click(navLinks[0])

    await waitFor(() => {
      expect(screen.getByText('Calculate')).toBeInTheDocument()
    })
  })

  it('navigates to settings view', async () => {
    globalThis.fetch = mockFetch(assetsResponse, calculationResponse)
    render(<App />)

    await userEvent.click(screen.getByRole('link', { name: /settings/i }))

    await waitFor(() => {
      expect(screen.getByText('Application Settings')).toBeInTheDocument()
    })
  })
})
