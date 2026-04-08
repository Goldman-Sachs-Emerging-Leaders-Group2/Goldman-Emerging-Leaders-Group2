import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders Northline branding', () => {
    render(<PageHeader theme="light" onToggleTheme={() => {}} onLogoClick={() => {}} />)
    expect(screen.getByText('Northline')).toBeInTheDocument()
    expect(screen.getByText('Plan with clarity.')).toBeInTheDocument()
  })

  it('calls onToggleTheme when theme button is clicked', async () => {
    const onToggle = vi.fn()
    render(<PageHeader theme="light" onToggleTheme={onToggle} onLogoClick={() => {}} />)
    await userEvent.click(screen.getByLabelText('Toggle color theme'))
    expect(onToggle).toHaveBeenCalled()
  })

  it('calls onLogoClick when brand is clicked', async () => {
    const onClick = vi.fn()
    render(<PageHeader theme="light" onToggleTheme={() => {}} onLogoClick={onClick} />)
    await userEvent.click(screen.getByRole('button', { name: /northline/i }))
    expect(onClick).toHaveBeenCalled()
  })

  it('shows dusk mode copy when the theme is light', () => {
    render(<PageHeader theme="light" onToggleTheme={() => {}} onLogoClick={() => {}} />)
    expect(screen.getByText('Dusk mode')).toBeInTheDocument()
  })
})
