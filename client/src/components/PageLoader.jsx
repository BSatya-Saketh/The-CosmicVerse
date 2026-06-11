import React from 'react';

export default function PageLoader() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            padding: '80px 72px',
            width: '100%',
            minHeight: '100vh',
            background: 'var(--bg)',
            color: 'var(--text2)',
            fontFamily: "'Space Mono', monospace"
        }}>
            {/* Pulsing Hero Skeleton */}
            <div style={{
                height: '240px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(90deg, var(--bg2) 25%, var(--border) 50%, var(--bg2) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }} />

            {/* Pulsing Title Skeleton */}
            <div style={{
                height: '40px',
                width: '60%',
                borderRadius: 'var(--radius)',
                background: 'linear-gradient(90deg, var(--bg2) 25%, var(--border) 50%, var(--bg2) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear'
            }} />

            {/* Pulsing Paragraph Skeleton */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        height: '18px',
                        width: i === 3 ? '40%' : '90%',
                        borderRadius: '4px',
                        background: 'linear-gradient(90deg, var(--bg2) 25%, var(--border) 50%, var(--bg2) 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s infinite linear'
                    }} />
                ))}
            </div>

            {/* Define shimmer animation dynamically */}
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>
        </div>
    );
}
