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

export const calculateFutureValue = async ({ ticker, investment, years, monthlyContribution = 0 }) => {
  const controller = new AbortController()
  const timeoutMs = 10000
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const params = {
    ticker,
    investment: String(investment),
    years: String(years),
  }
  if (monthlyContribution > 0) {
    params.monthlyContribution = String(monthlyContribution)
  }
  const queryParams = new URLSearchParams(params)

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

export const calculateMultipleFunds = async ({ tickers, investment, years, monthlyContribution = 0 }) => {
  const settled = await Promise.allSettled(
    tickers.map((ticker) => calculateFutureValue({ ticker, investment, years, monthlyContribution })),
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

export const getInvestments = async () => {
  const response = await fetch('/api/investments')

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

export const saveInvestment = async (data) => {
  const response = await fetch('/api/investments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

export const deleteInvestment = async (id) => {
  const response = await fetch(`/api/investments/${id}`, { method: 'DELETE' })

  if (!response.ok) {
    throw await parseError(response)
  }
}
