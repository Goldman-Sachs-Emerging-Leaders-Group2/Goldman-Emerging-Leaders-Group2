import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBanner from './StatusBanner'

describe('StatusBanner', () => {
  it('renders nothing when message is null', () => {
    const { container } = render(<StatusBanner type={null} message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders message with correct type class', () => {
    render(<StatusBanner type="error" message="Something went wrong" />)
    const banner = screen.getByText('Something went wrong')
    expect(banner).toBeInTheDocument()
    expect(banner).toHaveClass('status-banner', 'error')
  })

  it('renders info type', () => {
    render(<StatusBanner type="info" message="Loading…" />)
    const banner = screen.getByText('Loading…')
    expect(banner).toHaveClass('status-banner', 'info')
  })
})
