import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import PageTOC from './PageTOC.jsx';
import PageLoader from './PageLoader.jsx';
import ErrorBoundary from './ErrorBoundary.jsx';
import SearchOverlay from './SearchOverlay.jsx';
import NotesDrawer from './NotesDrawer.jsx';
import AuthOverlay from './AuthOverlay.jsx';
import SocratesDrawer from './SocratesDrawer.jsx';
import AiGraderDrawer from './AiGraderDrawer.jsx';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [notesOpen, setNotesOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const location = useLocation();

    // Close sidebar and scroll to top on navigation
    useEffect(() => {
        setSidebarOpen(false);
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // Handle global Ctrl+K or / search hotkeys
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setSearchOpen(o => !o);
            }
            if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="app-layout">
            <TopBar 
                onMenuClick={() => setSidebarOpen(o => !o)} 
                onSearchClick={() => setSearchOpen(true)} 
                onAuthClick={() => setAuthOpen(true)}
                notesOpen={notesOpen}
            />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="main-content">
                <ErrorBoundary>
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </ErrorBoundary>
            </main>
            <PageTOC />
            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <AuthOverlay isOpen={authOpen} onClose={() => setAuthOpen(false)} />
            
            {/* Floating Notes Toggle Button */}
            <button
                className={`notes-toggle-btn${notesOpen ? ' active' : ''}`}
                onClick={() => setNotesOpen(o => !o)}
                title="Toggle Study Notes"
                style={{
                    right: notesOpen ? '384px' : '24px',
                    transition: 'right 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease'
                }}
            >
                {notesOpen ? '✕' : '📝'}
            </button>
            <NotesDrawer isOpen={notesOpen} onClose={() => setNotesOpen(false)} page={location.pathname} />
            <SocratesDrawer />
            <AiGraderDrawer />
        </div>
    );
}
