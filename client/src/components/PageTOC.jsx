import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext.jsx';

function ChapterCompletionButton({ page, label }) {
    const { isCompleted, toggleCompleted } = useProgress();
    const completed = isCompleted(page, label);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                toggleCompleted(page, label);
            }}
            className={`chapter-complete-btn${completed ? ' completed' : ''}`}
            title={`Mark "${label}" as ${completed ? 'incomplete' : 'complete'}`}
        >
            <span>{completed ? '✓' : '○'}</span>
            <span>{completed ? 'Completed' : 'Mark Complete'}</span>
        </button>
    );
}

export default function PageTOC() {
    const [items, setItems]     = useState([]);
    const [targets, setTargets] = useState([]);
    const [active, setActive]   = useState(null);
    const [hovered, setHovered] = useState(false);
    const location              = useLocation();
    const { isCompleted, toggleCompleted } = useProgress();
    const observerRef           = useRef(null);
    const containerRef          = useRef(null); // direct DOM ref for smooth movement
    const isDraggingRef         = useRef(false);
    const startYRef             = useRef(0);
    const startScrollYRef       = useRef(0);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // only left click drags
        e.preventDefault(); // prevent text selection
        isDraggingRef.current = true;
        startYRef.current = e.clientY;
        startScrollYRef.current = window.scrollY;

        const onMouseMove = (moveEv) => {
            if (!isDraggingRef.current) return;
            const el = containerRef.current;
            if (!el) return;
            const vh = window.innerHeight;
            const pillH = el.offsetHeight;
            const dragRange = vh - pillH;
            if (dragRange <= 0) return;

            const deltaY = moveEv.clientY - startYRef.current;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) return;

            const deltaScroll = (deltaY / dragRange) * maxScroll;
            let targetScroll = startScrollYRef.current + deltaScroll;
            targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
            window.scrollTo(0, targetScroll);
        };

        const onMouseUp = () => {
            isDraggingRef.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const mutationObserverRef   = useRef(null);

    const scanSections = () => {
        // Temporarily stop observing to avoid self-triggering mutations during DOM updates
        if (mutationObserverRef.current) {
            mutationObserverRef.current.disconnect();
        }

        const sections = document.querySelectorAll('.chapter');
        console.log(`[PageTOC] Scanning sections. Found: ${sections.length}`);
        
        const found = [];
        const foundTargets = [];
        sections.forEach((sec, idx) => {
            const h2  = sec.querySelector('h2');
            const num = sec.querySelector('.chapter-num');
            if (!h2) return;
            const id = `toc-section-${idx}`;
            sec.setAttribute('id', id);
            
            const labelText = h2.textContent.trim();
            found.push({
                id,
                num:   num ? num.textContent.trim() : String(idx + 1).padStart(2, '0'),
                label: labelText,
            });

            // Establish clean mounting portal targets in DOM headers
            const header = sec.querySelector('.chapter-header');
            if (header) {
                let portalTarget = header.querySelector('.chapter-portal-target');
                if (!portalTarget) {
                    portalTarget = document.createElement('div');
                    portalTarget.className = 'chapter-portal-target';
                    portalTarget.style.marginLeft = 'auto';
                    portalTarget.style.display = 'flex';
                    portalTarget.style.alignItems = 'center';
                    header.appendChild(portalTarget);
                }
                foundTargets.push({
                    target: portalTarget,
                    label: labelText
                });
            }
        });

        // Only update state if items have actually changed to prevent infinite loops
        setItems(prev => {
            const same = prev.length === found.length && prev.every((item, i) => item.id === found[i].id && item.label === found[i].label);
            return same ? prev : found;
        });
        setTargets(prev => {
            const same = prev.length === foundTargets.length && prev.every((item, i) => item.target === foundTargets[i].target && item.label === foundTargets[i].label);
            return same ? prev : foundTargets;
        });

        // Reconnect observer to document body
        if (mutationObserverRef.current) {
            mutationObserverRef.current.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    };

    // ── Scan headings on route change & DOM updates ──────────────────
    useEffect(() => {
        // Clear targets and items immediately on route change
        setItems([]);
        setTargets([]);
        setActive(null);

        // Instantiate MutationObserver with chapter mutation filtering
        const observer = new MutationObserver((mutations) => {
            let hasChapterMutation = false;
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeType === 1) { // Element Node
                        if (node.classList.contains('chapter') || node.querySelector('.chapter')) {
                            hasChapterMutation = true;
                            break;
                        }
                    }
                }
                if (hasChapterMutation) break;
                for (const node of m.removedNodes) {
                    if (node.nodeType === 1) {
                        if (node.classList.contains('chapter') || node.querySelector('.chapter')) {
                            hasChapterMutation = true;
                            break;
                        }
                    }
                }
                if (hasChapterMutation) break;
            }

            if (hasChapterMutation) {
                console.log("[PageTOC] MutationObserver detected chapter addition/removal. Re-scanning...");
                scanSections();
            }
        });
        mutationObserverRef.current = observer;

        // Perform initial scan
        scanSections();

        // Backup timer to cover any initial render latency
        const timer = setTimeout(scanSections, 150);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
            mutationObserverRef.current = null;
        };
    }, [location.pathname]);

    // ── Smooth scroll-driven position — RAF + direct DOM update ───────
    // No React state involved, so NO re-renders on scroll = buttery smooth
    useEffect(() => {
        let rafId = null;

        const update = () => {
            const el = containerRef.current;
            if (!el) return;

            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress  = maxScroll > 0 ? Math.min(window.scrollY / maxScroll, 1) : 0;

            // Pill height estimate: clamp between 8vh and 92vh so it stays on screen
            const vh        = window.innerHeight;
            const pillH     = el.offsetHeight;
            const minTop    = pillH / 2;                   // px from top
            const maxTop    = vh - pillH / 2;              // px from top
            const topPx     = minTop + progress * (maxTop - minTop);

            el.style.top = `${topPx}px`;
            rafId = null;
        };

        const onScroll = () => {
            if (rafId) return;              // already scheduled
            rafId = requestAnimationFrame(update);
        };

        update(); // set initial position
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', update);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, [items]); // re-run when items change (pill height may change)

    // ── IntersectionObserver — active section dot ─────────────────────
    useEffect(() => {
        if (!items.length) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(
            entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        items.forEach(({ id }) => {
            const el = document.getElementById(id);
            if (el) observerRef.current.observe(el);
        });
        return () => observerRef.current?.disconnect();
    }, [items]);

    // ── Smooth scroll to section ──────────────────────────────────────
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        window.scrollTo({ top: absoluteTop - 64, behavior: 'smooth' });
    };

    if (!items.length) return null;

    return (
        <>
            {/* Portals to inject the completion buttons into static chapter headers */}
            {targets.map(({ target, label }) => 
                ReactDOM.createPortal(
                    <ChapterCompletionButton 
                        page={location.pathname} 
                        label={label} 
                    />,
                    target
                )
            )}

            {/* Floating page table of contents panel */}
            {ReactDOM.createPortal(
                <div
                    ref={containerRef}
                    className={`page-toc${hovered ? ' page-toc--open' : ''}`}
                    onMouseLeave={() => setHovered(false)}
                    aria-label="Page table of contents"
                >
                    {/* ── Pill handle ── */}
                    <div
                        className="page-toc__handle"
                        onMouseEnter={() => setHovered(true)}
                        onMouseDown={handleMouseDown}
                        aria-hidden="true"
                    >
                        {items.map(({ id }) => (
                            <div
                                key={id}
                                className={`page-toc__pip${active === id ? ' page-toc__pip--active' : ''}`}
                            />
                        ))}
                    </div>

                    {/* ── Expanded section list ── */}
                    <nav className="page-toc__list">
                        <div className="page-toc__header">On this page</div>
                        {items.map(({ id, num, label }) => {
                            const completed = isCompleted(location.pathname, label);
                            return (
                                <div
                                    key={id}
                                    className={`page-toc__item-wrapper${active === id ? ' page-toc__item-wrapper--active' : ''}`}
                                >
                                    <input
                                        type="checkbox"
                                        className="page-toc__checkbox"
                                        checked={completed}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            toggleCompleted(location.pathname, label);
                                        }}
                                        title={`Mark "${label}" as ${completed ? 'incomplete' : 'complete'}`}
                                    />
                                    <button
                                        className={`page-toc__item${active === id ? ' page-toc__item--active' : ''}`}
                                        onClick={() => scrollToSection(id)}
                                        title={label}
                                    >
                                        <span className="page-toc__num">{num}</span>
                                        <span className="page-toc__label">{label}</span>
                                    </button>
                                </div>
                            );
                        })}
                    </nav>
                </div>,
                document.body
            )}
        </>
    );
}
