import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    activeView: 'home',
    onNavigate: vi.fn(),
    savedCount: 0,
    onNewAnalysis: vi.fn(),
    hasResults: true,
  }

  it('renders the tabbed navigation', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Plan')).toBeInTheDocument()
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByText('Learn')).toBeInTheDocument()
  })

  it('marks the active item', () => {
    render(<Sidebar {...defaultProps} activeView="saved" />)
    const savedButton = screen.getByRole('button', { name: 'Saved' })
    expect(savedButton.className).toContain('is-active')
  })

  it('calls onNavigate when a tab is clicked', async () => {
    const onNavigate = vi.fn()
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />)
    await userEvent.click(screen.getByRole('button', { name: 'Plan' }))
    expect(onNavigate).toHaveBeenCalledWith('plan')
  })

  it('shows the saved count badge when there are saved scenarios', () => {
    render(<Sidebar {...defaultProps} savedCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('disables the results tab until a comparison exists', () => {
    render(<Sidebar {...defaultProps} hasResults={false} activeView="home" />)
    expect(screen.getByRole('button', { name: 'Results' })).toBeDisabled()
  })

  it('renders the new plan button', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByRole('button', { name: /new plan/i })).toBeInTheDocument()
  })

  it('calls onNewAnalysis when new plan is clicked', async () => {
    const onNewAnalysis = vi.fn()
    render(<Sidebar {...defaultProps} onNewAnalysis={onNewAnalysis} />)
    await userEvent.click(screen.getByRole('button', { name: /new plan/i }))
    expect(onNewAnalysis).toHaveBeenCalled()
  })
})
