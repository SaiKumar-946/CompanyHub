require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const companyRoutes = require('./routes/companies');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/companies', companyRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 CompanyHub API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;