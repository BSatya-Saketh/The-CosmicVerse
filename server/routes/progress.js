import express from 'express';
import Progress from '../models/Progress.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user curriculum progress
// @route   GET /api/progress
router.get('/', protect, async (req, res) => {
    try {
        let progress = await Progress.findOne({ user: req.user._id });
        if (!progress) {
            progress = await Progress.create({ user: req.user._id, completed: {} });
        }
        res.json({ success: true, completed: progress.completed || {} });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// @desc    Save/Sync user curriculum progress
// @route   POST /api/progress
router.post('/', protect, async (req, res) => {
    const { completed } = req.body;

    try {
        let progress = await Progress.findOne({ user: req.user._id });
        if (!progress) {
            progress = await Progress.create({ user: req.user._id, completed });
        } else {
            progress.completed = completed;
            progress.updatedAt = Date.now();
            await progress.save();
        }
        res.json({ success: true, completed: progress.completed });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
