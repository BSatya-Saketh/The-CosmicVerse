import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all user bookmarks
// @route   GET /api/bookmarks
router.get('/', protect, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ savedAt: -1 });
        res.json({ success: true, bookmarks });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Sync user bookmarks list (overwrite with client state)
// @route   POST /api/bookmarks/sync
router.post('/sync', protect, async (req, res) => {
    const { bookmarks } = req.body;

    try {
        // Clear past bookmarks and bulk insert the new client synchronized list
        await Bookmark.deleteMany({ user: req.user._id });
        
        if (bookmarks && bookmarks.length > 0) {
            const docs = bookmarks.map(b => ({
                user: req.user._id,
                page: b.page,
                title: b.title,
                lang: b.lang,
                code: b.code,
                savedAt: b.savedAt || new Date()
            }));
            await Bookmark.insertMany(docs);
        }
        
        const updated = await Bookmark.find({ user: req.user._id }).sort({ savedAt: -1 });
        res.json({ success: true, bookmarks: updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
