import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    page: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    lang: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    savedAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate bookmarks for the same snippet code block per user
BookmarkSchema.index({ user: 1, code: 1 }, { unique: true });

export default mongoose.model('Bookmark', BookmarkSchema);
