import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProgressProvider } from './ProgressContext';
import { AiProvider } from './AiContext';
import BookmarksPage from '../pages/BookmarksPage';
import { searchIndex } from '../data/searchIndex';

// Test wrapper
function renderWithContext(component) {
    return render(
        <BrowserRouter>
            <ProgressProvider>
                <AiProvider>
                    {component}
                </AiProvider>
            </ProgressProvider>
        </BrowserRouter>
    );
}

describe('Search & Bookmarks Integration', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('indexes curriculum search queries correctly', () => {
        // Test query matches for specific terms
        const queryTerm = 'jwt';
        const matches = searchIndex.filter(item => {
            return (
                item.title.toLowerCase().includes(queryTerm) ||
                item.category.toLowerCase().includes(queryTerm) ||
                item.keywords.some(kw => kw.includes(queryTerm))
            );
        });

        expect(matches.length).toBeGreaterThan(0);
        // Verify it points to the authentication page
        expect(matches.some(m => m.path === '/learn/auth')).toBe(true);
    });

    it('renders empty state when no bookmarks are present', () => {
        renderWithContext(<BookmarksPage />);
        expect(screen.getByText('Your Cheatsheet is empty')).toBeInTheDocument();
    });

    it('renders bookmarks and supports search filtering', () => {
        // Setup initial bookmarks in localStorage
        const testBookmarks = [
            {
                id: '1',
                page: '/learn/html',
                title: 'HTML Form Code',
                lang: 'html',
                code: '<form><input type="text"/></form>',
                savedAt: new Date().toISOString()
            },
            {
                id: '2',
                page: '/learn/javascript',
                title: 'JS Promise Code',
                lang: 'javascript',
                code: 'const p = new Promise()',
                savedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('fsc-bookmarks', JSON.stringify(testBookmarks));

        renderWithContext(<BookmarksPage />);

        // Check both bookmark titles are rendered
        expect(screen.getAllByText('HTML Form Code').length).toBeGreaterThan(0);
        expect(screen.getAllByText('JS Promise Code').length).toBeGreaterThan(0);

        // Query filtering: type 'form' in search box
        const searchInput = screen.getByPlaceholderText('Filter starred snippets...');
        fireEvent.change(searchInput, { target: { value: 'form' } });

        // HTML Form Code should still be here, JS Promise Code should be filtered out
        expect(screen.getAllByText('HTML Form Code').length).toBeGreaterThan(0);
        expect(screen.queryByText('JS Promise Code')).not.toBeInTheDocument();
    });
});
