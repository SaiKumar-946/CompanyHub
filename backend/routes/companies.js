const express = require('express');
const Company = require('../models/Company');
const router = express.Router();

// Get all companies with filters
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      industry, 
      location, 
      status,
      employees_min,
      employees_max,
      founded_after,
      founded_before,
      page = 1,
      limit = 10
    } = req.query;

    let filter = {};
    
    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Category filters
    if (industry) filter.industry = { $regex: industry, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (status) filter.status = status;
    
    // Range filters
    if (employees_min || employees_max) {
      filter.employees = {};
      if (employees_min) filter.employees.$gte = parseInt(employees_min);
      if (employees_max) filter.employees.$lte = parseInt(employees_max);
    }
    
    if (founded_after || founded_before) {
      filter.founded = {};
      if (founded_after) filter.founded.$gte = parseInt(founded_after);
      if (founded_before) filter.founded.$lte = parseInt(founded_before);
    }

    // Pagination
    const skip = (page - 1) * limit;
    const companies = await Company.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Company.countDocuments(filter);
    
    res.json({
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create company
router.post('/', async (req, res) => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

// Get single company
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid company ID' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Update company
router.put('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid company ID' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({ message: 'Company deleted successfully', company });
  } catch (error) {
    if (error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid company ID' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;