import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchIndex } from '../data/searchIndex.js';

export default function SearchOverlay({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // Reset state on open/close
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle background keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Perform query filtering
    const normalizedQuery = query.toLowerCase().trim();
    const results = normalizedQuery === '' 
        ? [] 
        : searchIndex.filter(item => {
            return (
                item.title.toLowerCase().includes(normalizedQuery) ||
                item.category.toLowerCase().includes(normalizedQuery) ||
                item.keywords.some(kw => kw.includes(normalizedQuery))
            );
        }).slice(0, 8); // cap results to top 8 items

    const handleSelectRoute = (path) => {
        navigate(path);
        onClose();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelectRoute(results[selectedIndex].path);
            }
        }
    };

    // Scroll active item into view
    useEffect(() => {
        if (resultsRef.current && results.length > 0) {
            const activeEl = resultsRef.current.children[selectedIndex];
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex, results.length]);

    return (
        <div className="search-backdrop" onClick={onClose}>
            <div 
                className="search-modal" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="search-input-wrapper">
                    <span className="search-input-icon">🔍</span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-field"
                        placeholder="Search for topics, guides, terms... (e.g. JWT, Flexbox, Mongoose)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <span className="search-close-hint">ESC</span>
                </div>

                {normalizedQuery !== '' && (
                    <div className="search-results" ref={resultsRef}>
                        {results.length > 0 ? (
                            results.map((item, idx) => (
                                <div
                                    key={item.path}
                                    className={`search-result-item${selectedIndex === idx ? ' selected' : ''}`}
                                    onClick={() => handleSelectRoute(item.path)}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                >
                                    <span className="search-result-icon">📄</span>
                                    <div className="search-result-details">
                                        <span className="search-result-title">{item.title}</span>
                                        <span className="search-result-category">{item.category}</span>
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text3)' }}>Enter ↵</span>
                                </div>
                            ))
                        ) : (
                            <div className="search-no-results">
                                No topics found matching "{query}"
                            </div>
                        )}
                    </div>
                )}
                
                {normalizedQuery === '' && (
                    <div className="search-no-results" style={{ padding: '24px 20px', color: 'var(--text3)' }}>
                        Type to search the MERN Stack curriculum...
                    </div>
                )}
            </div>
        </div>
    );
}
