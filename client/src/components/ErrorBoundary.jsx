import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error tracking service here
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/dashboard';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '80px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    minHeight: '60vh',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontFamily: "'Space Mono', monospace"
                }}>
                    <div style={{
                        fontSize: '64px',
                        marginBottom: '16px',
                        animation: 'pulse 2s infinite'
                    }}>
                        ⚠️
                    </div>
                    <h2 style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: '32px',
                        marginBottom: '16px',
                        fontWeight: '700'
                    }}>
                        Something went wrong.
                    </h2>
                    <p style={{
                        color: 'var(--text2)',
                        maxWidth: '500px',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        marginBottom: '32px'
                    }}>
                        An unexpected error occurred while loading this curriculum section. This has been logged, and you can reload or go back to safety.
                    </p>
                    {this.state.error && (
                        <pre style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border2)',
                            borderRadius: '6px',
                            padding: '16px',
                            maxWidth: '600px',
                            overflowX: 'auto',
                            textAlign: 'left',
                            fontSize: '11px',
                            color: '#ff5572',
                            marginBottom: '32px',
                            width: '100%'
                        }}>
                            <code>{this.state.error.toString()}</code>
                        </pre>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={this.handleReload}
                            style={{
                                background: 'var(--green)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '12px',
                                transition: 'opacity 0.15s'
                            }}
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={this.handleGoHome}
                            style={{
                                background: 'var(--surface)',
                                color: 'var(--text)',
                                border: '1px solid var(--border2)',
                                borderRadius: '4px',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '12px',
                                transition: 'background 0.15s'
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
