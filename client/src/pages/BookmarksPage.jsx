import React, { useState } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';
import CodeBlock from '../components/CodeBlock.jsx';
import { Link } from 'react-router-dom';

export default function BookmarksPage() {
    const { bookmarks, toggleBookmark } = useProgress();
    const [search, setSearch] = useState('');

    const filtered = bookmarks.filter(b => {
        const query = search.toLowerCase();
        return (
            b.title.toLowerCase().includes(query) ||
            b.code.toLowerCase().includes(query) ||
            b.page.toLowerCase().includes(query)
        );
    });

    // Helper to format path name (e.g. /learn/html -> HTML Foundations)
    const formatPageName = (path) => {
        if (!path) return '';
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        if (name === 'react') return 'React';
        if (name === 'nodejs') return 'Node.js';
        if (name === 'apis') return 'REST APIs';
        if (name === 'uploads') return 'File Uploads';
        if (name === 'socketio') return 'Socket.io';
        if (name === 'cicd') return 'CI/CD';
        return name.toUpperCase();
    };

    return (
        <section className="chapter" style={{ minHeight: '80vh' }}>
            <div className="chapter-header" style={{ marginBottom: '24px' }}>
                <div className="chapter-num" style={{ borderColor: 'var(--yellow)', color: 'var(--yellow)' }}>★</div>
                <div className="chapter-meta">
                    <div className="chapter-track" style={{ color: 'var(--yellow)' }}>Personal Cheatsheet</div>
                    <h2>Starred Snippets</h2>
                    <p className="chapter-intro">
                        Your custom reference sheet. Snippets you star across the curriculum will appear here instantly, persisted to your browser.
                    </p>
                </div>
            </div>

            {bookmarks.length > 0 ? (
                <>
                    {/* Search bar */}
                    <div style={{ marginBottom: '32px', maxWidth: '400px' }}>
                        <input
                            type="text"
                            placeholder="Filter starred snippets..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                background: 'var(--surface)',
                                border: '1px solid var(--border2)',
                                borderRadius: '6px',
                                color: 'var(--text)',
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {filtered.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {filtered.map(b => (
                                <div key={b.id} style={{
                                    border: '1px solid var(--border2)',
                                    borderRadius: '8px',
                                    background: 'var(--surface2)',
                                    padding: '16px',
                                    position: 'relative'
                                }}>
                                    {/* Snippet Header */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '12px',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ 
                                                fontSize: '10px', 
                                                fontFamily: "'Space Mono', monospace", 
                                                background: 'rgba(255, 209, 102, 0.1)', 
                                                color: 'var(--yellow)',
                                                padding: '2px 6px',
                                                borderRadius: '3px'
                                            }}>
                                                {formatPageName(b.page)}
                                            </span>
                                            <span style={{ 
                                                fontSize: '11px', 
                                                fontWeight: 'bold', 
                                                color: 'var(--text)' 
                                            }}>
                                                {b.title}
                                            </span>
                                        </div>
                                        
                                        <button 
                                            onClick={() => toggleBookmark(b)}
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                color: '#ff5572',
                                                fontSize: '11px',
                                                cursor: 'pointer',
                                                fontFamily: "'Space Mono', monospace"
                                            }}
                                        >
                                            [ Remove ]
                                        </button>
                                    </div>

                                    {/* Snippet Code block */}
                                    <CodeBlock code={b.code} lang={b.lang} title={b.title} />

                                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: "'Space Mono', monospace" }}>
                                            Saved: {new Date(b.savedAt).toLocaleDateString()}
                                        </span>
                                        <Link to={b.page} style={{
                                            fontSize: '11px',
                                            color: 'var(--green)',
                                            textDecoration: 'none'
                                        }}>
                                            View in Course →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="search-no-results">
                            No snippets found matching "{search}"
                        </div>
                    )}
                </>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    border: '1px dashed var(--border2)',
                    borderRadius: '8px',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>☆</div>
                    <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', marginBottom: '8px' }}>Your Cheatsheet is empty</h4>
                    <p style={{ color: 'var(--text3)', fontSize: '13.5px', maxWidth: '400px', marginBottom: '24px', lineHeight: '1.6' }}>
                        Browse the MERN chapters, find snippets you want to save, and click the "star" button in the code header.
                    </p>
                    <Link to="/dashboard" style={{
                        background: 'var(--green)',
                        color: '#000',
                        textDecoration: 'none',
                        padding: '10px 24px',
                        borderRadius: '4px',
                        fontWeight: '700',
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '12px'
                    }}>
                        Explore Curriculum
                    </Link>
                </div>
            )}
        </section>
    );
}
