import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('FIC ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '520px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '2px solid #e2e8f0',
            padding: '2.5rem 2rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>
              Something went wrong loading this section
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
              We've prevented a blank screen crash. Click below to reload or return home safely.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-positive"
                onClick={this.handleReset}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}
              >
                <RotateCcw size={15} />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
