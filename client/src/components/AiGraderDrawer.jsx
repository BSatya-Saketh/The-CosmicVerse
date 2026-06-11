import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useAi } from '../context/AiContext.jsx';

export default function AiGraderDrawer() {
    const { graderOpen, closeGrader, graderProject } = useAi();
    const { token } = useAuth();

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (graderOpen) {
            setCode('');
            setResult(null);
            setError('');
            setLoading(false);
        }
    }, [graderOpen]);

    // Cycling loading prompts to keep UI interactive
    useEffect(() => {
        if (!loading) return;
        
        const stages = [
            'Scaffolding evaluation container...',
            'Analyzing framework compliance...',
            'Validating State hook triggers...',
            'Checking data persistence triggers...',
            'Evaluating security & error handling...',
            'Formatting final scorecard...'
        ];
        
        setLoadingStage(stages[0]);
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % stages.length;
            setLoadingStage(stages[i]);
        }, 2500);

        return () => clearInterval(interval);
    }, [loading]);

    if (!graderOpen || !graderProject) return null;

    const handleEvaluate = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post(
                'http://localhost:5000/api/ai/grade',
                {
                    projectId: graderProject.id,
                    projectTitle: graderProject.title,
                    code: code
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.data && response.data.success) {
                setResult(response.data);
            } else {
                throw new Error('Failed to evaluate');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || err.message || 'Evaluation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 85) return 'var(--green)';
        if (score >= 70) return 'var(--yellow)';
        return 'var(--red)';
    };

    return (
        <div 
            className="grader-drawer"
            style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '500px',
                background: 'rgba(10, 10, 10, 0.88)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid var(--border2)',
                boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
        >
            {/* Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>🎯</span>
                    <div>
                        <h4 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: 'var(--text)', fontSize: '16px' }}>AI Code Grader</h4>
                        <span style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'var(--projects-color)' }}>Reviewer Dashboard</span>
                    </div>
                </div>
                <button 
                    onClick={closeGrader} 
                    style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '18px' }}
                >
                    ✕
                </button>
            </div>

            {/* Main Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Project Brief */}
                <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--projects-color)', fontFamily: "'Space Mono', monospace" }}>PROJECT #{graderProject.id}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: "'Space Mono', monospace" }}>{graderProject.difficulty}</span>
                    </div>
                    <h5 style={{ margin: '0 0 6px 0', fontFamily: "'Fraunces', serif", fontSize: '16px' }}>{graderProject.title}</h5>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>{graderProject.desc}</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {graderProject.concepts.map(c => (
                            <span key={c} style={{ fontSize: '9px', fontFamily: "'Space Mono', monospace", background: 'var(--bg3)', padding: '2px 6px', borderRadius: '3px', color: 'var(--text3)' }}>{c}</span>
                        ))}
                    </div>
                </div>

                {!token ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        color: 'var(--text2)',
                        padding: '20px'
                    }}>
                        <span style={{ fontSize: '36px', marginBottom: '16px' }}>🔒</span>
                        <h5 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>Authentication Required</h5>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                            You must be registered and signed in to submit code to the AI Grader and track your scores.
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text3)' }}>
                            Click the User icon in the top header bar to authenticate.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Editor Form / Loading / Result Panels */}
                        {!loading && !result && (
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
                                <label style={{ fontSize: '13px', color: 'var(--text2)' }}>Paste your React/Node code below:</label>
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="// Paste your implementation file here (e.g. App.jsx or server.js)"
                                    style={{
                                        flex: 1,
                                        minHeight: '220px',
                                        background: '#070707',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        color: 'var(--text)',
                                        fontFamily: "'Space Mono', monospace",
                                        fontSize: '12.5px',
                                        lineHeight: '1.6',
                                        resize: 'vertical',
                                        outline: 'none'
                                    }}
                                />
                                {error && <p style={{ color: 'var(--red)', fontSize: '12px', margin: 0 }}>❌ {error}</p>}
                                <button
                                    onClick={handleEvaluate}
                                    disabled={!code.trim()}
                                    style={{
                                        background: 'var(--projects-color)',
                                        color: 'black',
                                        fontFamily: "'Cabinet Grotesk', sans-serif",
                                        fontWeight: '800',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.15s',
                                        opacity: !code.trim() ? 0.5 : 1
                                    }}
                                >
                                    Submit for AI Evaluation
                                </button>
                            </div>
                        )}

                        {loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', padding: '40px 0' }}>
                                <div className="grader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(255,110,180,0.1)', borderTopColor: 'var(--projects-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text)' }}>Grading code submission...</p>
                                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text3)', fontFamily: "'Space Mono', monospace" }}>{loadingStage}</p>
                                </div>
                            </div>
                        )}

                        {result && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Score Indicator */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        border: `4px solid ${getScoreColor(result.score)}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '20px',
                                        fontWeight: '800',
                                        fontFamily: "'Space Mono', monospace",
                                        color: getScoreColor(result.score),
                                        background: 'rgba(0,0,0,0.2)'
                                    }}>
                                        {result.score}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h6 style={{ margin: '0 0 4px 0', fontSize: '15px', fontFamily: "'Fraunces', serif" }}>Score: {result.score}/100</h6>
                                        <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text2)', lineHeight: '1.5' }}>{result.summary}</p>
                                    </div>
                                </div>

                                {/* Criteria Details */}
                                <div>
                                    <h6 style={{ margin: '0 0 10px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text3)', fontFamily: "'Space Mono', monospace" }}>Criteria Details</h6>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {result.criteria && result.criteria.map((c, i) => (
                                            <div key={i} style={{ background: 'var(--bg2)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{c.name}</span>
                                                    <span style={{ fontSize: '12px', fontFamily: "'Space Mono', monospace", color: getScoreColor(c.score) }}>{c.score}%</span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2)', lineHeight: '1.5' }}>{c.feedback}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Strengths */}
                                {result.strengths && result.strengths.length > 0 && (
                                    <div>
                                        <h6 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--green)', fontFamily: "'Space Mono', monospace" }}>⭐ Key Strengths</h6>
                                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                    </div>
                                )}

                                {/* Improvements */}
                                {result.improvements && result.improvements.length > 0 && (
                                    <div>
                                        <h6 style={{ margin: '0 0 8px 0', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--orange)', fontFamily: "'Space Mono', monospace" }}>🛠️ Areas for Improvement</h6>
                                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {result.improvements.map((imp, i) => <li key={i}>{imp}</li>)}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={() => setResult(null)}
                                    style={{
                                        background: 'none',
                                        border: '1px solid var(--border2)',
                                        color: 'var(--text2)',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        fontSize: '12.5px',
                                        marginTop: '10px'
                                    }}
                                >
                                    Re-submit / Try Again
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Animation styling */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
}
