const projectService = require('../services/projectService');
const { validationResult } = require('express-validator');

class ProjectController {
  // Get all projects
  async getAllProjects(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
      const result = await projectService.getAllProjects(page, limit, search, status, type);
      res.json(result);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Create new project (Admin only)
  async createProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const projectData = {
        ...req.body,
        createdBy: req.user.id
      };

      const result = await projectService.createProject(projectData);
      res.status(201).json(result);
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Update project (Admin only)
  async updateProject(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await projectService.updateProject(req.params.id, req.body);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Delete project (Admin only)
  async deleteProject(req, res) {
    try {
      const result = await projectService.deleteProject(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get single project
  async getProjectById(req, res) {
    try {
      const result = await projectService.getProjectById(req.params.id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Get project by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }

  // Get projects for associate
  async getAssociateProjects(req, res) {
    try {
      const result = await projectService.getAssociateProjects(req.user.id);
      res.json(result);
    } catch (error) {
      console.error('Get associate projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
}

module.exports = new ProjectController();