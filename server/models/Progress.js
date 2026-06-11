import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    completed: {
        type: Map,
        of: [String],
        default: {}
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Progress', ProgressSchema);
