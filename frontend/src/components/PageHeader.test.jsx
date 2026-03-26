import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PageHeader from './PageHeader'

describe('PageHeader', () => {
  it('renders Goldman Sachs branding', () => {
    render(<PageHeader theme="light" onToggleTheme={() => {}} />)
    expect(screen.getByText('Goldman Sachs')).toBeInTheDocument()
    expect(screen.getByText('Emerging Leaders Program')).toBeInTheDocument()
    expect(screen.getByText('GS')).toBeInTheDocument()
    expect(screen.getByText('Group 2')).toBeInTheDocument()
  })

  it('calls onToggleTheme when theme button clicked', async () => {
    const onToggle = vi.fn()
    render(<PageHeader theme="light" onToggleTheme={onToggle} />)
    await userEvent.click(screen.getByLabelText('Toggle theme'))
    expect(onToggle).toHaveBeenCalled()
  })

  it('calls onLogoClick when brand is clicked', async () => {
    const onClick = vi.fn()
    render(<PageHeader theme="light" onToggleTheme={() => {}} onLogoClick={onClick} />)
    await userEvent.click(screen.getByText('Goldman Sachs'))
    expect(onClick).toHaveBeenCalled()
  })

  it('brand is not clickable when onLogoClick is undefined', () => {
    render(<PageHeader theme="light" onToggleTheme={() => {}} />)
    const brand = screen.getByText('Goldman Sachs').closest('div')
    expect(brand).not.toHaveAttribute('role', 'button')
  })
})
