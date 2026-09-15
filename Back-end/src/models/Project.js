const { Schema, model } = require('mongoose')

// Only allow http/https URLs — blocks javascript:, data: and other dangerous schemes
const urlValidator = {
  validator: (v) => !v || /^https?:\/\/.{3,}/.test(v),
  message: 'URL must start with http:// or https://',
}

const projectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    techStack: [{
      type: String,
      trim: true,
      maxlength: 100,
    }],
    category: {
      type: String,
      required: true,
      enum: ['Full-Stack', 'Frontend', 'Backend', 'Other'],
    },
    year: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'Year must be a valid 4-digit year'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    liveUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
      validate: urlValidator,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
      validate: urlValidator,
    },
    image: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
      // Only allow http/https or relative paths (no javascript:)
      validate: {
        validator: (v) => !v || /^(https?:\/\/.{3,}|\/[^<>]*)$/.test(v),
        message: 'Image must be a valid URL or relative path',
      },
    },
    highlights: [{
      type: String,
      maxlength: 500,
    }],
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

module.exports = model('Project', projectSchema)
