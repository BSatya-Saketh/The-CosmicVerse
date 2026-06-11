import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Route files
import authRoutes from './routes/auth.js';
import progressRoutes from './routes/progress.js';
import bookmarkRoutes from './routes/bookmarks.js';
import notesRoutes from './routes/notes.js';
import aiRoutes from './routes/ai.js';

// Load env vars
dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);

// Health check route
app.get('/', (req, res) => {
    res.json({ status: 'API is running successfully...' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/FullStackCompass';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully to database');
        app.listen(PORT, () => {
            console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error(`❌ Database connection error: ${err.message}`);
        process.exit(1);
    });
