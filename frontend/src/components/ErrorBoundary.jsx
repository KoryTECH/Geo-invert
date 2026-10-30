import { Component } from 'react'

// Last-resort render guard: instead of a blank page, show the error
// message and stack. Re-mount the tree by clicking "Try again".
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
    this.reset = () => this.setState({ error: null, info: null })
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Also surface in devtools
    console.error('ErrorBoundary caught:', error, info)
    this.setState({ info })
  }

  render() {
    const { error, info } = this.state
    if (!error) return this.props.children
    return (
      <div className="error-boundary" role="alert">
        <span className="placeholder-tag mono">RUNTIME ERROR</span>
        <h1>The page failed to render</h1>
        <pre className="mono error-message">{error.message || String(error)}</pre>
        {error.stack && <pre className="mono error-stack">{error.stack}</pre>}
        {info?.componentStack && (
          <div>
            <h2>Component stack</h2>
            <pre className="mono error-stack">{info.componentStack}</pre>
          </div>
        )}
        <button type="button" className="error-reset" onClick={this.reset}>
          Try again
        </button>
      </div>
    )
  }
}
