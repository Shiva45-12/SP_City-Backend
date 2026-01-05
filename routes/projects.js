const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
    
    let query = {};

    // Add search filters
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const projects = await Project.find(query)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Project.countDocuments(query);

    res.json({
      success: true,
      data: projects,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin only)
router.post('/', [
  auth,
  adminAuth,
  body('name').notEmpty().withMessage('Project name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['Residential', 'Commercial', 'Industrial']).withMessage('Valid type is required'),
  body('startDate').notEmpty().withMessage('Start date is required'),
  body('budget').optional().isNumeric().withMessage('Budget must be a number'),
  body('totalUnits').optional().isInt({ min: 1 }).withMessage('Total units must be at least 1'),
  body('pricePerUnit').optional().isNumeric().withMessage('Price per unit must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Set default values for optional fields
    const projectData = {
      name: req.body.name,
      location: req.body.location,
      type: req.body.type,
      startDate: new Date(req.body.startDate),
      budget: req.body.budget || 0,
      totalUnits: req.body.totalUnits || 1,
      availableUnits: req.body.totalUnits || 1,
      pricePerUnit: req.body.pricePerUnit || 0,
      description: req.body.description || '',
      endDate: req.body.endDate ? new Date(req.body.endDate) : null,
      amenities: req.body.amenities || [],
      images: req.body.images || [],
      assignedTo: req.body.assignedTo || [],
      createdBy: req.user.id
    };

    const project = new Project(projectData);
    await project.save();

    const populatedProject = await Project.findById(project._id)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: populatedProject
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  adminAuth,
  body('name').optional().notEmpty().withMessage('Project name cannot be empty'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name').populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('assignedTo', 'name')
      .populate('createdBy', 'name');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;