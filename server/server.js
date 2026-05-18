const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for flexibility in development/deployment
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares for parsing request bodies
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    demoMode: db.isDemoMode(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kpis', require('./routes/kpi'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/data', require('./routes/data'));
app.use('/api/reports', require('./routes/reports'));

// Serve static assets in production mode
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all route to serve the React index.html for Single Page Application routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      // In development or if React hasn't been built yet
      res.status(200).send('BI Dashboard API Server is running. Frontend build was not found.');
    }
  });
});

// Central Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error Caught:', err.message);
  res.status(500).json({
    message: err.message || 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`================================================`);
  console.log(`🚀 BI Dashboard Server is live on Port ${PORT}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 Mode: ${db.isDemoMode() ? 'In-Memory Demo Mode' : 'Connected to PostgreSQL'}`);
  console.log(`================================================`);
});
