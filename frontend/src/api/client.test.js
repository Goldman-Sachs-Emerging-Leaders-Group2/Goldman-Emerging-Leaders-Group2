import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getMutualFunds, calculateFutureValue, calculateMultipleFunds } from './client'

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

    await expect(calculateFutureValue(params)).rejects.toThrow('Calculation request timed out')
  })

  it('throws network error message on fetch failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(calculateFutureValue(params)).rejects.toThrow('Unable to connect to the server')
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
