const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  source: {
    type: String,
    enum: ['Website', 'Facebook', 'Google', 'Referral', 'Walk-in', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  budget: {
    type: Number,
    min: 0
  },
  requirements: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followUpDate: {
    type: Date
  },
  lastContactDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);