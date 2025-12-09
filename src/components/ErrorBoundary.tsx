'use client'

import React, { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: {
    componentStack: string
    errorBoundary: string
    timestamp: string
  }
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: {
        componentStack: '',
        errorBoundary: '',
        timestamp: ''
      }
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorInfo: {
        componentStack: error.stack || '',
        errorBoundary: 'error',
        timestamp: new Date().toISOString()
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      hasError: true,
      error,
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: 'error',
        timestamp: new Date().toISOString()
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-red-600 text-sm">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-gray-600 mt-2">
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: { componentStack: '', errorBoundary: '', timestamp: '' } })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary