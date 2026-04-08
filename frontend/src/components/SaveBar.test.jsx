import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SaveBar from './SaveBar'

describe('SaveBar', () => {
  const defaultProps = {
    label: '',
    onLabelChange: vi.fn(),
    onSave: vi.fn(),
    saveStatus: null,
    resultCount: 1,
  }

  it('renders the label input and save button', () => {
    render(<SaveBar {...defaultProps} />)
    expect(screen.getByPlaceholderText(/scenario label/i)).toBeInTheDocument()
    expect(screen.getByText('Save scenario')).toBeInTheDocument()
  })

  it('shows plural button text for multiple results', () => {
    render(<SaveBar {...defaultProps} resultCount={3} />)
    expect(screen.getByText('Save scenarios')).toBeInTheDocument()
  })

  it('calls onSave when the button is clicked', async () => {
    const onSave = vi.fn()
    render(<SaveBar {...defaultProps} onSave={onSave} />)
    await userEvent.click(screen.getByText('Save scenario'))
    expect(onSave).toHaveBeenCalled()
  })

  it('calls onSave on Enter key', async () => {
    const onSave = vi.fn()
    render(<SaveBar {...defaultProps} onSave={onSave} />)
    const input = screen.getByPlaceholderText(/scenario label/i)
    await userEvent.type(input, '{Enter}')
    expect(onSave).toHaveBeenCalled()
  })

  it('shows saving state', () => {
    render(<SaveBar {...defaultProps} saveStatus="saving" />)
    expect(screen.getByText(/saving/i)).toBeInTheDocument()
  })

  it('shows saved state', () => {
    render(<SaveBar {...defaultProps} saveStatus="saved" />)
    expect(screen.getByText(/^saved$/i)).toBeInTheDocument()
  })

  it('disables the button while saving', () => {
    render(<SaveBar {...defaultProps} saveStatus="saving" />)
    expect(screen.getByText(/saving/i).closest('button')).toBeDisabled()
  })
})
