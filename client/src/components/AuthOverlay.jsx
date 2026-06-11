import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useProgress } from '../context/ProgressContext.jsx';

export default function AuthOverlay({ isOpen, onClose }) {
    const { user, login, register, logout, error, setError } = useAuth();
    const { totalCompleted, bookmarks } = useProgress();
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        let success = false;
        if (isRegister) {
            success = await register(email, password);
        } else {
            success = await login(email, password);
        }

        setLoading(false);
        if (success) {
            setEmail('');
            setPassword('');
            onClose();
        }
    };

    return (
        <div className="search-backdrop" onClick={onClose}>
            <div 
                className="search-modal" 
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '420px', padding: '24px' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', margin: 0, color: 'var(--text)' }}>
                        {user ? 'Your Account' : (isRegister ? 'Create Account' : 'Sign In')}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '14px' }}
                    >
                        ✕
                    </button>
                </div>

                {/* Logged In State */}
                {user ? (
                    <div>
                        <p style={{ fontSize: '13.5px', color: 'var(--text2)', marginBottom: '16px' }}>
                            Authenticated as: <strong style={{ color: 'var(--text)' }}>{user.email}</strong>
                        </p>
                        
                        {/* Course stats sync representation */}
                        <div style={{
                            background: 'var(--surface2)',
                            border: '1px solid var(--border2)',
                            borderRadius: '6px',
                            padding: '12px 16px',
                            marginBottom: '24px',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text3)' }}>Checked chapters:</span>
                                <strong style={{ color: 'var(--green)' }}>{totalCompleted}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text3)' }}>Starred snippets:</span>
                                <strong style={{ color: 'var(--yellow)' }}>{bookmarks.length}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '2px' }}>
                                <span style={{ color: 'var(--text3)' }}>Cloud Sync status:</span>
                                <span style={{ color: 'var(--green)', fontWeight: 'bold' }}>✓ Synced with MongoDB</span>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'rgba(255, 95, 86, 0.1)',
                                color: '#ff5f56',
                                border: '1px solid #ff5f56',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '12px'
                            }}
                        >
                            Sign Out
                        </button>
                    </div>
                ) : (
                    /* Authentication Form */
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {error && (
                            <div style={{
                                padding: '8px 12px',
                                background: 'rgba(255, 85, 114, 0.1)',
                                border: '1px solid #ff5572',
                                borderRadius: '4px',
                                color: '#ff5572',
                                fontSize: '12px',
                                lineHeight: '1.4'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: 'var(--text3)' }}>EMAIL ADDRESS</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                style={{
                                    padding: '10px 12px',
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border2)',
                                    borderRadius: '4px',
                                    color: 'var(--text)',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '11px', fontFamily: "'Space Mono', monospace", color: 'var(--text3)' }}>PASSWORD</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    padding: '10px 12px',
                                    background: 'var(--bg)',
                                    border: '1px solid var(--border2)',
                                    borderRadius: '4px',
                                    color: 'var(--text)',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '10px',
                                padding: '12px',
                                background: 'var(--green)',
                                color: '#000',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontFamily: "'Space Mono', monospace",
                                fontSize: '12px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsRegister(!isRegister);
                                    setError(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--green)',
                                    fontSize: '11px',
                                    cursor: 'pointer',
                                    textDecoration: 'underline'
                                }}
                            >
                                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
