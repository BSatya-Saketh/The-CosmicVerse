import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProgressProvider, useProgress } from './ProgressContext';

// Simple consumer component for testing context
function TestComponent() {
    const { isCompleted, toggleCompleted, overallProgress, getPageProgress } = useProgress();

    return (
        <div>
            <div data-testid="overall">{overallProgress}%</div>
            <div data-testid="page-progress">{getPageProgress('/learn/html')}%</div>
            <div data-testid="item-status">
                {isCompleted('/learn/html', 'Setup') ? 'Completed' : 'Incomplete'}
            </div>
            <button data-testid="toggle-btn" onClick={() => toggleCompleted('/learn/html', 'Setup')}>
                Toggle
            </button>
        </div>
    );
}

describe('ProgressContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('initializes with default values and responds to toggle operations', () => {
        render(
            <ProgressProvider>
                <TestComponent />
            </ProgressProvider>
        );

        expect(screen.getByTestId('overall').textContent).toBe('0%');
        expect(screen.getByTestId('page-progress').textContent).toBe('0%');
        expect(screen.getByTestId('item-status').textContent).toBe('Incomplete');

        // Click toggle button to mark "Setup" as completed
        fireEvent.click(screen.getByTestId('toggle-btn'));

        expect(screen.getByTestId('item-status').textContent).toBe('Completed');
        // Total chapters = 195. 1 completed is (1/195)*100 = 1%
        expect(screen.getByTestId('overall').textContent).toBe('1%');
        // HTML has 15 chapters. 1 completed is (1/15)*100 = 7%
        expect(screen.getByTestId('page-progress').textContent).toBe('7%');
    });
});
