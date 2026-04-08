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

function createFetchMock({
  fundsResult = fundsResponse,
  calcResults = { VFIAX: calculationResponse },
  initialSaved = [],
} = {}) {
  let savedInvestments = [...initialSaved]

  return vi.fn((url, options = {}) => {
    const method = options.method || 'GET'

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

    if (typeof url === 'string' && url.endsWith('/api/investments') && method === 'GET') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(savedInvestments),
      })
    }

    if (typeof url === 'string' && url.endsWith('/api/investments') && method === 'POST') {
      const payload = JSON.parse(options.body)
      const saved = {
        id: savedInvestments.length + 1,
        savedAt: '2026-04-07T12:00:00.000Z',
        ...payload,
      }
      savedInvestments = [saved, ...savedInvestments]
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(saved),
      })
    }

    if (typeof url === 'string' && url.includes('/api/investments/') && method === 'DELETE') {
      const id = Number(url.split('/').pop())
      savedInvestments = savedInvestments.filter((investment) => investment.id !== id)
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }

    return Promise.reject(new Error(`Unknown URL: ${url}`))
  })
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
  window.scrollTo = vi.fn()
})

describe('App', () => {
  it('renders the Northline landing page and primary CTA flow', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    expect(screen.getByRole('heading', { name: /compare fund paths with a calmer, clearer planning workflow/i })).toBeInTheDocument()
    expect(screen.getByText(/Northline helps first-time investors/i)).toBeInTheDocument()
    expect(screen.getByText(/does not provide financial advice, investment advice, or a recommendation/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Results' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: /build a plan/i }))

    expect(screen.getByRole('heading', { name: /build the comparison you want to trust/i })).toBeInTheDocument()
    expect(screen.getByText(/Pick the funds you want to compare/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0)
      expect(screen.getAllByText('FXAIX').length).toBeGreaterThan(0)
    })
  })

  it('navigates between tabs and shows the learn view', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Learn' }))

    expect(screen.getByRole('heading', { name: /learn the building blocks behind a sound comparison/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start a plan/i })).toBeInTheDocument()
  })

  it('shows warning when the API returns an empty fund array', async () => {
    globalThis.fetch = createFetchMock({ fundsResult: [] })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))

    await waitFor(() => {
      expect(screen.getByText('No funds available')).toBeInTheDocument()
    })
  })

  it('shows validation when no funds are selected', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))

    await waitFor(() => expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0))

    const checkboxes = screen.getAllByRole('checkbox')
    await userEvent.click(checkboxes[0])
    await userEvent.click(screen.getByRole('button', { name: /build comparison/i }))

    expect(screen.getByText('Please select at least one mutual fund.')).toBeInTheDocument()
  })

  it('shows validation when the initial investment is zero', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))
    await waitFor(() => expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0))

    const investmentInput = screen.getByLabelText('Initial investment')
    await userEvent.clear(investmentInput)
    await userEvent.type(investmentInput, '0')
    await userEvent.click(screen.getByRole('button', { name: /build comparison/i }))

    expect(screen.getByText('Investment must be greater than 0.')).toBeInTheDocument()
  })

  it('transitions to results after a successful calculation', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))
    await waitFor(() => expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0))

    await userEvent.click(screen.getByRole('button', { name: /build comparison/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /read the tradeoffs, not just the biggest number/i })).toBeInTheDocument()
    })

    expect(screen.getByText('Projected leader')).toBeInTheDocument()
    expect(screen.getAllByText('$52,345.67').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'Results' })).not.toBeDisabled()
  })

  it('supports saving, reopening, and deleting a scenario', async () => {
    globalThis.fetch = createFetchMock()
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))
    await waitFor(() => expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0))
    await userEvent.click(screen.getByRole('button', { name: /build comparison/i }))

    await waitFor(() => expect(screen.getByText('Save scenario')).toBeInTheDocument())

    await userEvent.type(screen.getByLabelText('Scenario label'), 'Retirement baseline')
    await userEvent.click(screen.getByRole('button', { name: /^save scenario$/i }))

    await waitFor(() => expect(screen.getAllByText(/^saved$/i).length).toBeGreaterThan(0))

    await userEvent.click(screen.getByTitle('Saved'))

    await waitFor(() => {
      expect(screen.getByText('Retirement baseline')).toBeInTheDocument()
    })

    await userEvent.click(screen.getByTitle('Open in results'))
    await waitFor(() => expect(screen.getByText('Projected leader')).toBeInTheDocument())

    await userEvent.click(screen.getByTitle('Saved'))
    await waitFor(() => expect(screen.getByTitle('Delete scenario')).toBeInTheDocument())
    await userEvent.click(screen.getByTitle('Delete scenario'))
    await userEvent.click(screen.getByRole('button', { name: /confirm delete/i }))

    await waitFor(() => {
      expect(screen.getByText(/no saved scenarios yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error banner when all calculations fail', async () => {
    globalThis.fetch = createFetchMock({ calcResults: new Error('External API failed') })
    render(<App />)

    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))
    await waitFor(() => expect(screen.getAllByText('VFIAX').length).toBeGreaterThan(0))
    await userEvent.click(screen.getByRole('button', { name: /build comparison/i }))

    await waitFor(() => {
      expect(screen.getByText('External API failed')).toBeInTheDocument()
    })
  })
})
