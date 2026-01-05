const Project = require('../models/Project');

class ProjectService {
  // Get all projects with filters
  async getAllProjects(page, limit, search, status, type) {
    try {
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

      return {
        success: true,
        data: projects,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new project
  async createProject(projectData) {
    try {
      // Set available units equal to total units initially
      projectData.availableUnits = projectData.totalUnits;

      const project = new Project(projectData);
      await project.save();

      const populatedProject = await Project.findById(project._id)
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name');

      return {
        success: true,
        message: 'Project created successfully',
        data: populatedProject
      };
    } catch (error) {
      throw error;
    }
  }

  // Update project
  async updateProject(projectId, updateData) {
    try {
      let project = await Project.findById(projectId);
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      project = await Project.findByIdAndUpdate(
        projectId,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'name').populate('createdBy', 'name');

      return {
        success: true,
        message: 'Project updated successfully',
        data: project
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete project
  async deleteProject(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      await Project.findByIdAndDelete(projectId);

      return {
        success: true,
        message: 'Project deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get single project
  async getProjectById(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name');

      if (!project) {
        return {
          success: false,
          message: 'Project not found'
        };
      }

      return {
        success: true,
        data: project
      };
    } catch (error) {
      throw error;
    }
  }

  // Get projects for associate
  async getAssociateProjects(associateId) {
    try {
      const projects = await Project.find({
        assignedTo: { $in: [associateId] }
      })
        .populate('assignedTo', 'name')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 });

      return {
        success: true,
        data: projects
      };
    } catch (error) {
      throw error;
    }
  }

  // Get project statistics
  async getProjectStats() {
    try {
      const totalProjects = await Project.countDocuments();
      
      const statusStats = await Project.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const typeStats = await Project.aggregate([
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        data: {
          total: totalProjects,
          byStatus: statusStats,
          byType: typeStats
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProjectService();