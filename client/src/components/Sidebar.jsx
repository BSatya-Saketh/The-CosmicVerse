import React from 'react';
import { NavLink } from 'react-router-dom';
import { navSections } from '../data/navData.js';
import { useProgress } from '../context/ProgressContext.jsx';

export default function Sidebar({ isOpen, onClose }) {
    const { overallProgress, getPageProgress } = useProgress();

    return (
        <nav className={`sidebar${isOpen ? ' open' : ''}`}>
            <div className="sidebar-logo">
                <div className="logo-mark">
                    <div className="logo-text-group">
                        <div className="logo-title">The Cosmic<span>Verse</span></div>
                    </div>
                </div>
            </div>

            <div className="sidebar-progress">
                <div className="progress-label">
                    <span>Overall Progress</span>
                    <span>{overallProgress}%</span>
                </div>
                <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {navSections.map((sec, i) => (
                    <React.Fragment key={i}>
                        <div className="nav-section">{sec.section}</div>
                        {sec.items.map((item, j) => {
                            const pageProgress = getPageProgress(item.to);
                            return (
                                <NavLink
                                    key={`${i}-${j}`}
                                    to={item.to}
                                    onClick={onClose}
                                    className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                                >
                                    <span className="nav-dot" style={{ background: item.dot }} />
                                    <span style={{ flex: 1 }}>{item.label}</span>
                                    {pageProgress > 0 && (
                                        <span style={{ 
                                            fontSize: '9px', 
                                            color: pageProgress === 100 ? 'var(--green)' : 'var(--text3)', 
                                            fontFamily: "'Space Mono', monospace",
                                            background: pageProgress === 100 ? 'rgba(0, 229, 155, 0.1)' : 'var(--surface2)',
                                            padding: '1px 5px',
                                            borderRadius: '3px',
                                            border: pageProgress === 100 ? '1px solid rgba(0, 229, 155, 0.3)' : '1px solid var(--border2)',
                                            lineHeight: '1',
                                            fontWeight: 'bold'
                                        }}>
                                            {pageProgress === 100 ? '✓' : `${pageProgress}%`}
                                        </span>
                                    )}
                                </NavLink>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <a
                    href="https://thecosmicverse.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        fontSize:    '11px',
                        color:       'var(--text3)',
                        fontFamily:  "'Space Mono', monospace",
                        textDecoration: 'none',
                        display:     'flex',
                        alignItems:  'center',
                        gap:         '6px',
                    }}
                >
                    <span>↗</span> thecosmicverse.in
                </a>
            </div>
        </nav>
    );
}