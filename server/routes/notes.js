import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all user notes mapped by page path
// @route   GET /api/notes
router.get('/', protect, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id });
        const notesMap = {};
        notes.forEach(note => {
            notesMap[note.page] = note.text;
        });
        res.json({ success: true, notes: notesMap });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Sync user notes map (upsert user page notes)
// @route   POST /api/notes/sync
router.post('/sync', protect, async (req, res) => {
    const { notes } = req.body;

    try {
        if (notes) {
            const ops = Object.keys(notes).map(async (page) => {
                const text = notes[page];
                return Note.findOneAndUpdate(
                    { user: req.user._id, page },
                    { text, updatedAt: Date.now() },
                    { upsert: true, new: true }
                );
            });
            await Promise.all(ops);
        }

        const updated = await Note.find({ user: req.user._id });
        const notesMap = {};
        updated.forEach(note => {
            notesMap[note.page] = note.text;
        });
        res.json({ success: true, notes: notesMap });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
