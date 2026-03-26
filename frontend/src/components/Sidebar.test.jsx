import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  const defaultProps = {
    activeView: 'results',
    onNavigate: vi.fn(),
    savedCount: 0,
    onNewAnalysis: vi.fn(),
  }

  it('renders all nav items', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('Results')).toBeInTheDocument()
    expect(screen.getByText('History')).toBeInTheDocument()
    expect(screen.getByText('AI Advisor')).toBeInTheDocument()
  })

  it('highlights the active item', () => {
    render(<Sidebar {...defaultProps} activeView="history" />)
    const historyBtn = screen.getByText('History').closest('button')
    expect(historyBtn.className).toContain('font-semibold')
  })

  it('calls onNavigate when a nav item is clicked', async () => {
    const onNavigate = vi.fn()
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByText('History'))
    expect(onNavigate).toHaveBeenCalledWith('history')
  })

  it('shows saved count badge on History', () => {
    render(<Sidebar {...defaultProps} savedCount={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('does not show badge when savedCount is 0', () => {
    render(<Sidebar {...defaultProps} savedCount={0} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('disables AI Advisor item', () => {
    render(<Sidebar {...defaultProps} />)
    const aiBtn = screen.getByText('AI Advisor').closest('button')
    expect(aiBtn).toBeDisabled()
    expect(screen.getByText('Soon')).toBeInTheDocument()
  })

  it('does not navigate when disabled item is clicked', async () => {
    const onNavigate = vi.fn()
    render(<Sidebar {...defaultProps} onNavigate={onNavigate} />)

    await userEvent.click(screen.getByText('AI Advisor'))
    expect(onNavigate).not.toHaveBeenCalled()
  })

  it('renders New Analysis button', () => {
    render(<Sidebar {...defaultProps} />)
    expect(screen.getByText('+ New Analysis')).toBeInTheDocument()
  })

  it('calls onNewAnalysis when New Analysis is clicked', async () => {
    const onNewAnalysis = vi.fn()
    render(<Sidebar {...defaultProps} onNewAnalysis={onNewAnalysis} />)

    await userEvent.click(screen.getByText('+ New Analysis'))
    expect(onNewAnalysis).toHaveBeenCalled()
  })
})
