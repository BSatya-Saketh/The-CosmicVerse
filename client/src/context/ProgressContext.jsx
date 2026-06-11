import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { chaptersCountMap, TOTAL_CURRICULUM_CHAPTERS } from '../data/chaptersCount.js';
import { useAuth } from './AuthContext.jsx';

const ProgressContext = createContext(null);

const BASE_URL = 'http://localhost:5000/api';

export function ProgressProvider({ children }) {
    const auth = useAuth();
    const token = auth ? auth.token : null;

    const [progress, setProgress] = useState(() => {
        try {
            const saved = localStorage.getItem('fsc-completed-chapters');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    const [bookmarks, setBookmarks] = useState(() => {
        try {
            const saved = localStorage.getItem('fsc-bookmarks');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [notes, setNotes] = useState(() => {
        try {
            const saved = localStorage.getItem('fsc-notes-by-page');
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    });

    // Save states to local storage
    useEffect(() => {
        localStorage.setItem('fsc-completed-chapters', JSON.stringify(progress));
    }, [progress]);

    useEffect(() => {
        localStorage.setItem('fsc-bookmarks', JSON.stringify(bookmarks));
    }, [bookmarks]);

    useEffect(() => {
        localStorage.setItem('fsc-notes-by-page', JSON.stringify(notes));
    }, [notes]);

    // One-time sync on login/token availability
    useEffect(() => {
        if (!token) return;

        const syncWithBackend = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // 1. Fetch & Merge Progress Checkpoints
                const progressRes = await axios.get(`${BASE_URL}/progress`, config);
                const dbProgress = progressRes.data.completed || {};
                
                const mergedProgress = { ...progress };
                Object.keys(dbProgress).forEach(page => {
                    const localItems = mergedProgress[page] || [];
                    const dbItems = dbProgress[page] || [];
                    mergedProgress[page] = Array.from(new Set([...localItems, ...dbItems]));
                });
                
                await axios.post(`${BASE_URL}/progress`, { completed: mergedProgress }, config);
                setProgress(mergedProgress);

                // 2. Fetch & Merge Bookmarks
                const bookmarksRes = await axios.get(`${BASE_URL}/bookmarks`, config);
                const dbBookmarks = bookmarksRes.data.bookmarks || [];
                
                const mergedBookmarks = [...bookmarks];
                dbBookmarks.forEach(dbB => {
                    if (!mergedBookmarks.some(b => b.code === dbB.code)) {
                        mergedBookmarks.push({
                            page: dbB.page,
                            title: dbB.title,
                            lang: dbB.lang,
                            code: dbB.code,
                            savedAt: dbB.savedAt
                        });
                    }
                });

                await axios.post(`${BASE_URL}/bookmarks/sync`, { bookmarks: mergedBookmarks }, config);
                setBookmarks(mergedBookmarks);

                // 3. Fetch & Merge Notes
                const notesRes = await axios.get(`${BASE_URL}/notes`, config);
                const dbNotes = notesRes.data.notes || {};
                
                const mergedNotes = { ...notes };
                Object.keys(dbNotes).forEach(page => {
                    if (!mergedNotes[page] || mergedNotes[page].trim() === '') {
                        mergedNotes[page] = dbNotes[page];
                    }
                });

                await axios.post(`${BASE_URL}/notes/sync`, { notes: mergedNotes }, config);
                setNotes(mergedNotes);

                console.log('🔄 Data successfully synchronized with MongoDB database');
            } catch (err) {
                console.error('Failed to sync data with backend:', err.message);
            }
        };

        syncWithBackend();
    }, [token]);

    const isCompleted = (page, chapterLabel) => {
        if (!page || !chapterLabel) return false;
        const pageChapters = progress[page] || [];
        return pageChapters.includes(chapterLabel);
    };

    const toggleCompleted = async (page, chapterLabel) => {
        if (!page || !chapterLabel) return;

        const updatedProgress = { ...progress };
        const current = updatedProgress[page] || [];
        const next = current.includes(chapterLabel)
            ? current.filter(label => label !== chapterLabel)
            : [...current, chapterLabel];
        
        updatedProgress[page] = next;
        setProgress(updatedProgress);

        if (token) {
            try {
                await axios.post(
                    `${BASE_URL}/progress`,
                    { completed: updatedProgress },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error('Failed to sync progress toggle:', err.message);
            }
        }
    };

    const isBookmarked = (code) => {
        if (!code) return false;
        return bookmarks.some(b => b.code === code);
    };

    const toggleBookmark = async (bookmark) => {
        if (!bookmark || !bookmark.code) return;

        let updatedBookmarks;
        const exists = bookmarks.some(b => b.code === bookmark.code);
        if (exists) {
            updatedBookmarks = bookmarks.filter(b => b.code !== bookmark.code);
        } else {
            updatedBookmarks = [...bookmarks, {
                page: bookmark.page,
                title: bookmark.title,
                lang: bookmark.lang,
                code: bookmark.code,
                savedAt: new Date().toISOString()
            }];
        }
        setBookmarks(updatedBookmarks);

        if (token) {
            try {
                await axios.post(
                    `${BASE_URL}/bookmarks/sync`,
                    { bookmarks: updatedBookmarks },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error('Failed to sync bookmarks toggle:', err.message);
            }
        }
    };

    const updateNote = async (page, text) => {
        if (!page) return;

        const updatedNotes = { ...notes, [page]: text };
        setNotes(updatedNotes);

        if (token) {
            try {
                await axios.post(
                    `${BASE_URL}/notes/sync`,
                    { notes: { [page]: text } },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error('Failed to sync note save:', err.message);
            }
        }
    };

    const totalCompleted = Object.values(progress).reduce((acc, curr) => {
        return acc + (Array.isArray(curr) ? curr.length : 0);
    }, 0);

    const overallProgress = TOTAL_CURRICULUM_CHAPTERS > 0 
        ? Math.round((totalCompleted / TOTAL_CURRICULUM_CHAPTERS) * 100) 
        : 0;

    const getPageProgress = (page) => {
        const totalPageChapters = chaptersCountMap[page] || 0;
        if (totalPageChapters === 0) return 0;
        const completedPageChapters = (progress[page] || []).length;
        return Math.round((completedPageChapters / totalPageChapters) * 100);
    };

    return (
        <ProgressContext.Provider value={{
            progress,
            isCompleted,
            toggleCompleted,
            overallProgress,
            getPageProgress,
            totalCompleted,
            totalChapters: TOTAL_CURRICULUM_CHAPTERS,
            bookmarks,
            isBookmarked,
            toggleBookmark,
            notes,
            updateNote
        }}>
            {children}
        </ProgressContext.Provider>
    );
}

export const useProgress = () => useContext(ProgressContext);
