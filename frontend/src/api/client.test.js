import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMutualFunds, calculateFutureValue, calculateMultipleFunds, getInvestments, saveInvestment, deleteInvestment } from './client'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getMutualFunds', () => {
  it('returns parsed fund array on success', async () => {
    const funds = [{ ticker: 'VFIAX', name: 'Vanguard 500', expectedAnnualReturn: 0.15 }]
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(funds),
    })

    const result = await getMutualFunds()
    expect(result).toEqual(funds)
    expect(fetch).toHaveBeenCalledWith('/api/mutualfunds')
  })

  it('throws with server message on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'Server error' }),
    })

    await expect(getMutualFunds()).rejects.toThrow('Server error')
  })

  it('throws on invalid JSON response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('bad json')),
    })

    await expect(getMutualFunds()).rejects.toThrow('Received an invalid response from the server.')
  })
})

describe('calculateFutureValue', () => {
  const params = { ticker: 'VFIAX', investment: 10000, years: 10 }

  it('returns parsed result on success', async () => {
    const result = { futureValue: 50000, capmReturn: 0.16 }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(result),
    })

    const data = await calculateFutureValue(params)
    expect(data).toEqual(result)
  })

  it('throws with server message on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      json: () => Promise.resolve({ message: 'External API failed' }),
    })

    await expect(calculateFutureValue(params)).rejects.toThrow('External API failed')
  })

  it('throws timeout message on AbortError', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    globalThis.fetch = vi.fn().mockRejectedValue(abortError)

    await expect(calculateFutureValue(params)).rejects.toThrow(/timed out/)
  })

  it('throws network error message on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(calculateFutureValue(params)).rejects.toThrow(/Unable to connect/)
  })

  it('throws on invalid JSON response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.reject(new Error('bad json')),
    })

    await expect(calculateFutureValue(params)).rejects.toThrow('Received an invalid response from the server.')
  })
})

describe('calculateMultipleFunds', () => {
  it('returns results map for all successful calls', async () => {
    const resultA = { ticker: 'VFIAX', futureValue: 50000 }
    const resultB = { ticker: 'FXAIX', futureValue: 48000 }

    globalThis.fetch = vi.fn((url) => {
      const ticker = new URLSearchParams(url.split('?')[1]).get('ticker')
      const data = ticker === 'VFIAX' ? resultA : resultB
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) })
    })

    const { results, errors } = await calculateMultipleFunds({
      tickers: ['VFIAX', 'FXAIX'],
      investment: 10000,
      years: 10,
    })

    expect(results.VFIAX).toEqual(resultA)
    expect(results.FXAIX).toEqual(resultB)
    expect(Object.keys(errors)).toHaveLength(0)
  })

  it('handles partial failures', async () => {
    globalThis.fetch = vi.fn((url) => {
      const ticker = new URLSearchParams(url.split('?')[1]).get('ticker')
      if (ticker === 'VFIAX') {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ ticker: 'VFIAX', futureValue: 50000 }) })
      }
      return Promise.resolve({ ok: false, status: 502, json: () => Promise.resolve({ message: 'API down' }) })
    })

    const { results, errors } = await calculateMultipleFunds({
      tickers: ['VFIAX', 'BAD'],
      investment: 10000,
      years: 10,
    })

    expect(results.VFIAX).toBeDefined()
    expect(errors.BAD).toBeDefined()
  })
})

describe('getInvestments', () => {
  it('returns parsed array on success', async () => {
    const data = [{ id: 1, ticker: 'VFIAX', futureValue: 50000 }]
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })

    const result = await getInvestments()
    expect(result).toEqual(data)
    expect(fetch).toHaveBeenCalledWith('/api/investments')
  })

  it('throws on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: 'DB error' }),
    })

    await expect(getInvestments()).rejects.toThrow('DB error')
  })
})

describe('saveInvestment', () => {
  it('sends POST with JSON body and returns saved entity', async () => {
    const input = { ticker: 'VFIAX', initialInvestment: 10000 }
    const saved = { ...input, id: 1, savedAt: '2026-03-25T12:00:00' }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(saved),
    })

    const result = await saveInvestment(input)
    expect(result).toEqual(saved)
    expect(fetch).toHaveBeenCalledWith('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  })

  it('throws on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'ticker is required.' }),
    })

    await expect(saveInvestment({})).rejects.toThrow('ticker is required.')
  })
})

describe('deleteInvestment', () => {
  it('sends DELETE to correct URL', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: true })

    await deleteInvestment(42)
    expect(fetch).toHaveBeenCalledWith('/api/investments/42', { method: 'DELETE' })
  })

  it('throws on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    })

    await expect(deleteInvestment(999)).rejects.toThrow('Not found')
  })
})
