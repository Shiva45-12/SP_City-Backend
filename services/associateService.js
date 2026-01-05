const User = require('../models/User');

class AssociateService {
  // Get all associates with pagination and search
  async getAllAssociates(page, limit, search) {
    try {
      const query = {
        role: 'associate',
        ...(search && {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } }
          ]
        })
      };

      const associates = await User.find(query)
        .select('-password')
        .populate('createdBy', 'name')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await User.countDocuments(query);

      return {
        success: true,
        data: associates,
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

  // Create new associate
  async createAssociate(associateData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ email: associateData.email }, { username: associateData.username }]
      });

      if (existingUser) {
        return {
          success: false,
          message: 'User with this email or username already exists'
        };
      }

      // Set role-based permissions
      const rolePermissions = {
        'Sales Executive': ['leads'],
        'Team Lead': ['leads', 'projects'],
        'Sales Manager': ['leads', 'projects', 'reports']
      };

      const associate = new User({
        ...associateData,
        role: 'associate',
        permissions: associateData.permissions || rolePermissions[associateData.role] || []
      });

      await associate.save();

      return {
        success: true,
        message: 'Associate created successfully',
        data: {
          id: associate._id,
          name: associate.name,
          email: associate.email,
          username: associate.username,
          phone: associate.phone,
          role: associate.role,
          department: associate.department,
          permissions: associate.permissions
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update associate
  async updateAssociate(associateId, updateData) {
    try {
      const associate = await User.findById(associateId);
      if (!associate || associate.role !== 'associate') {
        return {
          success: false,
          message: 'Associate not found'
        };
      }

      // Remove password from update data
      delete updateData.password;

      const updatedAssociate = await User.findByIdAndUpdate(
        associateId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      return {
        success: true,
        message: 'Associate updated successfully',
        data: updatedAssociate
      };
    } catch (error) {
      throw error;
    }
  }

  // Change associate password
  async changeAssociatePassword(associateId, newPassword) {
    try {
      const associate = await User.findById(associateId);
      if (!associate || associate.role !== 'associate') {
        return {
          success: false,
          message: 'Associate not found'
        };
      }

      associate.password = newPassword;
      await associate.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Delete associate
  async deleteAssociate(associateId) {
    try {
      const associate = await User.findById(associateId);
      if (!associate || associate.role !== 'associate') {
        return {
          success: false,
          message: 'Associate not found'
        };
      }

      await User.findByIdAndDelete(associateId);

      return {
        success: true,
        message: 'Associate deleted successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get associate profile
  async getAssociateProfile(associateId) {
    try {
      const associate = await User.findById(associateId).select('-password');
      return {
        success: true,
        data: associate
      };
    } catch (error) {
      throw error;
    }
  }

  // Update associate profile
  async updateAssociateProfile(associateId, updateData) {
    try {
      // Remove sensitive fields
      delete updateData.password;
      delete updateData.role;
      delete updateData.permissions;

      const updatedAssociate = await User.findByIdAndUpdate(
        associateId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password');

      return {
        success: true,
        message: 'Profile updated successfully',
        data: updatedAssociate
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AssociateService();