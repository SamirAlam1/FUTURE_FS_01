const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    organization: {
      type: String,
      required: [true, 'Organization is required'],
      trim: true,
      maxlength: [150, 'Organization cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Coursera', 'Cisco NetAcad', 'Internship', 'Workshop', 'Other'],
      default: 'Other',
    },
    issueDate: {
      type: Date,
      required: [true, 'Issue date is required'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    credentialId: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Credential ID cannot exceed 200 characters'],
    },
    credentialUrl: {
      type: String,
      trim: true,
      default: '',
    },
    certificateImage: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', certificationSchema);
