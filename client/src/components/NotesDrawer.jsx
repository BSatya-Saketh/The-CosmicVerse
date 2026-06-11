import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext.jsx';

export default function NotesDrawer({ isOpen, onClose, page }) {
    const { notes, updateNote } = useProgress();
    const [text, setText] = useState('');
    const [saveStatus, setSaveStatus] = useState('Saved');

    // Load notes when page or open state changes
    useEffect(() => {
        if (isOpen && page) {
            setText(notes[page] || '');
            setSaveStatus('Saved');
        }
    }, [page, isOpen, notes]);

    // Debounce save logic
    useEffect(() => {
        if (!isOpen || !page) return;

        // Verify if content has actually changed to prevent duplicate updates
        if ((notes[page] || '') === text) {
            return;
        }

        setSaveStatus('Saving...');
        const timer = setTimeout(() => {
            updateNote(page, text);
            setSaveStatus('Saved');
        }, 800); // 800ms auto-save debounce

        return () => clearTimeout(timer);
    }, [text, page, isOpen, notes, updateNote]);

    // Format page title for display in the header (e.g. /learn/html -> HTML Foundations)
    const formatPageName = (path) => {
        if (!path) return '';
        const parts = path.split('/');
        const name = parts[parts.length - 1];
        if (name === 'react') return 'React Ecosystem';
        if (name === 'nodejs') return 'Node.js Runtime';
        if (name === 'apis') return 'REST APIs';
        if (name === 'uploads') return 'File Uploads';
        if (name === 'socketio') return 'Socket.io Chat';
        if (name === 'cicd') return 'CI/CD Pipelines';
        if (name === 'deploy') return 'Production Deployment';
        return name.toUpperCase() + ' Study Guide';
    };

    return (
        <div className={`notes-drawer${isOpen ? ' open' : ''}`}>
            <div className="notes-drawer-header">
                <span className="notes-drawer-title">📝 {formatPageName(page)}</span>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text3)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px'
                    }}
                >
                    ✕
                </button>
            </div>
            
            <div className="notes-drawer-body">
                <p style={{ color: 'var(--text3)', fontSize: '11px', lineHeight: '1.4', margin: 0 }}>
                    Type your custom notes, cheatsheet pointers, or checklist bookmarks here. They save automatically.
                </p>
                
                <textarea
                    className="notes-textarea"
                    placeholder="Start taking notes on this module..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                
                <div className="notes-save-status">
                    {saveStatus === 'Saving...' ? '✍️ Saving...' : '✓ Auto-Saved'}
                </div>
            </div>
        </div>
    );
}
