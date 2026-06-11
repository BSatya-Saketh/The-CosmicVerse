import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useAi } from '../context/AiContext.jsx';

export default function SocratesDrawer() {
    const { socratesOpen, closeSocrates, socratesCode, socratesLang, socratesTitle } = useAi();
    const { token, user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [showContext, setShowContext] = useState(false);

    const messagesEndRef = useRef(null);

    // Reset messages when a new code snippet context is loaded
    useEffect(() => {
        if (socratesOpen && socratesCode) {
            setMessages([
                {
                    role: 'assistant',
                    content: `Greetings! I am **Socrates**. I see you're looking at **${socratesTitle || socratesLang}**.\n\nWhat would you like to explore about this code? Click a quick prompt below or type your questions directly!`
                }
            ]);
        }
    }, [socratesOpen, socratesCode, socratesTitle, socratesLang]);

    // Auto-scroll messages to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!socratesOpen) return null;

    const handleSendMessage = async (textToSend) => {
        const userText = textToSend || input;
        if (!userText.trim()) return;

        if (!textToSend) setInput('');

        // 1. Add user message and a blank assistant response bubble for streaming
        const updatedMessages = [...messages, { role: 'user', content: userText }];
        setMessages([...updatedMessages, { role: 'assistant', content: '' }]);
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: socratesCode,
                    lang: socratesLang,
                    title: socratesTitle,
                    messages: updatedMessages
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Connection failed');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let done = false;
            let accumulatedText = '';

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '').trim();
                            if (dataStr === '[DONE]') {
                                done = true;
                                break;
                            }
                            try {
                                const parsed = JSON.parse(dataStr);
                                if (parsed.text) {
                                    accumulatedText += parsed.text;
                                    setMessages(prev => {
                                        const next = [...prev];
                                        const last = next[next.length - 1];
                                        if (last && last.role === 'assistant') {
                                            last.content = accumulatedText;
                                        }
                                        return next;
                                    });
                                } else if (parsed.error) {
                                    accumulatedText += `\n\n❌ ${parsed.error}`;
                                    setMessages(prev => {
                                        const next = [...prev];
                                        const last = next[next.length - 1];
                                        if (last && last.role === 'assistant') {
                                            last.content = accumulatedText;
                                        }
                                        return next;
                                    });
                                }
                            } catch (e) {
                                // Incomplete chunk, parse on next round
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last && last.role === 'assistant') {
                    last.content = `❌ Error: ${err.message || 'Failed to fetch explanation.'}`;
                }
                return next;
            });
        } finally {
            setLoading(false);
        }
    };

    const handleQuickPrompt = (promptText) => {
        if (loading) return;
        handleSendMessage(promptText);
    };

    return (
        <div 
            className="socrates-drawer"
            style={{
                position: 'fixed',
                right: 0,
                top: 0,
                bottom: 0,
                width: '420px',
                background: 'rgba(10, 10, 10, 0.85)',
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
                    <span style={{ fontSize: '20px' }}>🎓</span>
                    <div>
                        <h4 style={{ margin: 0, fontFamily: "'Fraunces', serif", color: 'var(--text)', fontSize: '16px' }}>Socrates AI Tutor</h4>
                        <span style={{ fontSize: '10px', fontFamily: "'Space Mono', monospace", color: 'var(--purple)' }}>GEMINI FLASH 2.0</span>
                    </div>
                </div>
                <button 
                    onClick={closeSocrates} 
                    style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '18px' }}
                >
                    ✕
                </button>
            </div>

            {/* Context Snippet preview */}
            <div style={{ background: 'rgba(181, 122, 255, 0.04)', borderBottom: '1px solid var(--border2)' }}>
                <button 
                    onClick={() => setShowContext(!showContext)}
                    style={{
                        width: '100%',
                        padding: '10px 20px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        color: 'var(--purple)',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <span>📄 Context: {socratesTitle} ({socratesLang})</span>
                    <span>{showContext ? '▲ Hide Code' : '▼ View Code'}</span>
                </button>
                {showContext && (
                    <pre style={{
                        margin: 0,
                        padding: '12px 20px',
                        background: '#050505',
                        fontSize: '11px',
                        maxHeight: '150px',
                        overflowY: 'auto',
                        borderTop: '1px solid var(--border)'
                    }}>
                        <code style={{ color: 'var(--text2)' }}>{socratesCode}</code>
                    </pre>
                )}
            </div>

            {/* Chat Messages */}
            <div 
                style={{ 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '20px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '16px' 
                }}
            >
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
                        <h5 style={{ fontFamily: "'Fraunces', serif", fontSize: '18px', color: 'var(--text)', marginBottom: '8px' }}>Auth Required</h5>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                            You must be registered and signed in to consult Socrates and receive code assistance.
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text3)' }}>
                            Please sign in using the button in the top navigation bar.
                        </p>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div 
                                key={i} 
                                style={{
                                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    background: msg.role === 'user' ? 'rgba(181, 122, 255, 0.12)' : 'var(--bg2)',
                                    border: msg.role === 'user' ? '1px solid rgba(181, 122, 255, 0.2)' : '1px solid var(--border)',
                                    borderRadius: '12px',
                                    padding: '12px 16px',
                                    color: 'var(--text)',
                                    fontSize: '13.5px',
                                    lineHeight: '1.6',
                                    whiteSpace: 'pre-wrap'
                                }}
                            >
                                {msg.role === 'assistant' && msg.content === '' && loading ? (
                                    <div className="socrates-typing" style={{ display: 'flex', gap: '4px', padding: '4px 0' }}>
                                        <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--purple)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out' }}></div>
                                        <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--purple)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.2s' }}></div>
                                        <div className="typing-dot" style={{ width: '6px', height: '6px', background: 'var(--purple)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out 0.4s' }}></div>
                                    </div>
                                ) : (
                                    // Extremely basic markdown-to-html converter for inline displays
                                    <div dangerouslySetInnerHTML={{
                                        __html: msg.content
                                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                            .replace(/`(.*?)`/g, '<code style="background:var(--bg3);padding:2px 4px;border-radius:3px;font-family:\'Space Mono\',monospace;font-size:11.5px">$1</code>')
                                    }} />
                                )}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input & Utilities */}
            {token && (
                <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Shortcut chips */}
                    {messages.length <= 2 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {[
                                'Line by line breakdown',
                                'Explain the core logic',
                                'Find potential bugs',
                                'How to optimize this?'
                            ].map((chip) => (
                                <button
                                    key={chip}
                                    onClick={() => handleQuickPrompt(chip)}
                                    disabled={loading}
                                    style={{
                                        background: 'var(--bg3)',
                                        border: '1px solid var(--border2)',
                                        borderRadius: '20px',
                                        padding: '4px 12px',
                                        color: 'var(--text2)',
                                        fontSize: '11px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--purple)'}
                                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border2)'}
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Text Area Input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Ask Socrates a question..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                height: '44px',
                                background: 'var(--bg2)',
                                border: '1px solid var(--border2)',
                                borderRadius: '8px',
                                padding: '10px 14px',
                                color: 'var(--text)',
                                fontSize: '13px',
                                resize: 'none',
                                outline: 'none'
                            }}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                width: '44px',
                                height: '44px',
                                background: 'var(--purple)',
                                border: 'none',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                opacity: (loading || !input.trim()) ? 0.5 : 1,
                                transition: 'opacity 0.15s'
                            }}
                        >
                            ➔
                        </button>
                    </div>
                </div>
            )}

            {/* Animation styling */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
            `}} />
        </div>
    );
}
