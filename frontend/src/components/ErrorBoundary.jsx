import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            Something went wrong
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-150"
            style={{ background: 'var(--accent)', color: '#00244D' }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
