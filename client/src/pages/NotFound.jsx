import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div style={{
            padding: '80px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            minHeight: '65vh',
            background: 'var(--bg)',
            color: 'var(--text)',
            fontFamily: "'Space Mono', monospace"
        }}>
            {/* The 404 Badge */}
            <div style={{
                display: 'inline-block',
                padding: '4px 12px',
                background: 'rgba(255, 95, 86, 0.1)',
                color: '#ff5f56',
                borderRadius: '4px',
                fontSize: '11px',
                marginBottom: '24px',
                fontWeight: 700,
                border: '1px solid #ff5f56'
            }}>
                CODE 404: PATH NOT FOUND
            </div>

            {/* Error Message */}
            <h1 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '48px',
                lineHeight: '1.1',
                marginBottom: '16px',
                fontWeight: '900'
            }}>
                You've wandered off <br />
                <span style={{ color: 'var(--green)', fontStyle: 'italic' }}>the learning path.</span>
            </h1>

            {/* Sub-text */}
            <p style={{
                maxWidth: '500px',
                fontSize: '14.5px',
                lineHeight: '1.75',
                color: 'var(--text2)',
                marginBottom: '40px'
            }}>
                The page you are looking for doesn't exist or has been moved. Use the sidebar or click the link below to resume your MERN stack journey.
            </p>

            {/* Link button */}
            <Link 
                to="/dashboard" 
                style={{
                    background: 'var(--green)',
                    color: '#000',
                    textDecoration: 'none',
                    padding: '12px 28px',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '13px',
                    fontFamily: "'Space Mono', monospace",
                    boxShadow: '0 4px 12px rgba(0, 229, 155, 0.2)',
                    transition: 'transform 0.15s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
                Back to Dashboard →
            </Link>
        </div>
    );
}
