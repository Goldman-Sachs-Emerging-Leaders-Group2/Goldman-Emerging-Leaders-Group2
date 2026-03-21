const parseError = async (response) => {
  let message = `Request failed with status ${response.status}`

  try {
    const body = await response.json()
    if (body?.message) {
      message = body.message
    }
  } catch {
  }

  return new Error(message)
}

export const getMutualFunds = async () => {
  const response = await fetch('/api/mutualfunds')

  if (!response.ok) {
    throw await parseError(response)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('Received an invalid response from the server.')
  }
}

export const calculateFutureValue = async ({ ticker, investment, years }) => {
  const controller = new AbortController()
  const timeoutMs = 10000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const queryParams = new URLSearchParams({
    ticker,
    investment: String(investment),
    years: String(years),
  })

  let response

  try {
    response = await fetch(`/api/calculate?${queryParams.toString()}`, {
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Calculation request timed out. Please try again.')
    }

    throw new Error('Unable to connect to the server. Check your network connection.')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw await parseError(response)
  }

  try {
    return await response.json()
  } catch {
    throw new Error('Received an invalid response from the server.')
  }
}

export const calculateMultipleFunds = async ({ tickers, investment, years }) => {
  const settled = await Promise.allSettled(
    tickers.map((ticker) => calculateFutureValue({ ticker, investment, years })),
  )

  const results = {}
  const errors = {}

  settled.forEach((outcome, index) => {
    const ticker = tickers[index]
    if (outcome.status === 'fulfilled') {
      results[ticker] = outcome.value
    } else {
      errors[ticker] = outcome.reason?.message || 'Calculation failed.'
    }
  })

  return { results, errors }
}
