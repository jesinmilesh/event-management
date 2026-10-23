const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const eventRoutes = require('./routes/eventRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// URL normalization for Vercel serverless rewrites
app.use((req, res, next) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api') && !req.url.startsWith('/api')) {
    req.url = req.originalUrl;
  }
  next();
});

// Serve frontend static UI
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes (supports both /api/* and direct /* rewrite)
app.use('/api/events', eventRoutes);
app.use('/events', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'Event Management API' });
});

// Catch-all 404 for unhandled API routes (returns JSON, never crashes)
app.all(/\/api\/.*/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// SPA Fallback: serve frontend index.html for all non-API paths
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler (converts all exceptions into safe JSON responses, preventing 500 crashes)
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const statusCode = err.statusCode || (err.name === 'ValidationError' ? 400 : 500);
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(` Event System running at: http://localhost:${PORT}`);
    console.log(`=================================================`);
  });
}

module.exports = app;
