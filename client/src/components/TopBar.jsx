import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function TopBar({ onMenuClick, onSearchClick, onAuthClick }) {
    const fillRef = useRef(null);
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();

    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement;
            const pct = h.scrollTop / (h.scrollHeight - h.clientHeight);
            if (fillRef.current) {
                fillRef.current.style.transform = `scaleX(${isNaN(pct) ? 0 : pct})`;
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <div className="top-bar">
                <div className="top-bar-fill" ref={fillRef} />
            </div>

            {/* Floating header controls (theme toggle + mobile menu) */}
            <div style={{
                position: 'fixed',
                top: '10px',
                right: '16px',
                zIndex: 250,
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
            }}>
                <button
                    onClick={onAuthClick}
                    title={user ? `Profile: ${user.email}` : "Sign In / Register"}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: user ? 'var(--green)' : 'var(--text2)',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s',
                        borderColor: user ? 'rgba(0, 229, 155, 0.4)' : 'var(--border2)'
                    }}
                >
                    👤 {user ? user.email.split('@')[0] : 'Sign In'}
                </button>

                <button
                    onClick={onSearchClick}
                    title="Search curriculum (Ctrl+K or /)"
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'var(--text2)',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s',
                    }}
                >
                    🔍 Search <kbd style={{ background: 'var(--surface2)', padding: '1px 3px', border: '1px solid var(--border2)', borderRadius: '3px', fontSize: '9px' }}>/</kbd>
                </button>

                <button
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        color: 'var(--text2)',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s',
                    }}
                >
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>

                {/* Mobile menu button — hidden on desktop via CSS */}
                <button
                    onClick={onMenuClick}
                    style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border2)',
                        borderRadius: '6px',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: 'var(--text2)',
                    }}
                    className="mobile-menu-btn"
                >
                    ☰
                </button>
            </div>
        </>
    );
}