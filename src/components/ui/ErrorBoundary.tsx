import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-error)',
          fontFamily: 'var(--font-body)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-md)',
          margin: '1rem',
        }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Algo salió mal</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            {this.state.error?.message || 'Error inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface-2)',
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}