require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB  👈 ADD THIS SECTION
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Companies routes
const companyRoutes = require('./routes/companies');
app.use('/api/companies', companyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});