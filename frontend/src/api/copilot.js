export const sendCopilotMessage = async ({ mode, message, context }) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('/api/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, message, context }),
      signal: controller.signal,
    })

    if (!response.ok) {
      let errorMessage = 'Copilot is temporarily unavailable.'
      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorMessage
      } catch {
        // ignore parse errors
      }
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}
