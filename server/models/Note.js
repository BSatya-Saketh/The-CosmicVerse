import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    page: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user only has one note instance per page
NoteSchema.index({ user: 1, page: 1 }, { unique: true });

export default mongoose.model('Note', NoteSchema);
