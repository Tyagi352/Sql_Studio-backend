require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: ['https://sql-studio-frontend-seven.vercel.app'],
    credentials: true,
}));

// app.options('*', cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: '🔐 CipherSQLStudio API is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/assignments', require('./src/routes/assignments'));
app.use('/api/execute', require('./src/routes/execute'));
app.use('/api/submissions', require('./src/routes/submissions'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 CipherSQLStudio API running on http://localhost:${PORT}`);
});

module.exports = app;
