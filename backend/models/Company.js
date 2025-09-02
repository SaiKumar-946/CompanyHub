const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Company name is required'],
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  employees: {
    type: Number,
    min: [0, 'Employee count cannot be negative']
  },
  founded: {
    type: Number,
    min: [1800, 'Founded year seems too old'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

// Add text index for search
companySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Company', companySchema);