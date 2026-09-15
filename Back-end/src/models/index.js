const { Schema, model } = require('mongoose')

// Shared URL validator — only allow http/https URLs
const urlValidator = {
  validator: (v) => !v || /^https?:\/\/.{3,}/.test(v),
  message: 'URL must start with http:// or https://',
}

// ─── Skill ────────────────────────────────────────────────────

const skillSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: true,
      enum: ['Languages', 'Frontend', 'Backend', 'Database', 'Tools'],
    },
    proficiency: {
      type: Number,
      min: 0,
      max: 100,
      default: 75,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// ─── Education ────────────────────────────────────────────────

const educationSchema = new Schema(
  {
    institution: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    field: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    board: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    startYear: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'Start year must be a valid 4-digit year'],
    },
    endYear: {
      type: String,
      required: true,
      match: [/^\d{4}$/, 'End year must be a valid 4-digit year'],
    },
    grade: {
      type: String,
      default: '',
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// ─── Experience ───────────────────────────────────────────────

const experienceSchema = new Schema(
  {
    company: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    type: {
      type: String,
      trim: true,
      default: 'Full-time',
      maxlength: 50,
    },
    startDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    endDate: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote',
      maxlength: 150,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    highlights: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every(item => typeof item === 'string' && item.length <= 500),
        message: 'Each highlight must be a string of at most 500 characters',
      },
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// ─── Certification ────────────────────────────────────────────

const certificationSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    issuer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    date: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    credentialUrl: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
      validate: urlValidator,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
)

// ─── Message ──────────────────────────────────────────────────

const messageSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    read: {
      type: Boolean,
      default: false,
    },
    ip: {
      type: String,
      default: '',
      trim: true,
      maxlength: 45, // IPv6 max length
    },
  },
  { timestamps: true },
)

// ─── Models ───────────────────────────────────────────────────

module.exports = {
  Skill: model('Skill', skillSchema),
  Education: model('Education', educationSchema),
  Experience: model('Experience', experienceSchema),
  Certification: model('Certification', certificationSchema),
  Message: model('Message', messageSchema),
}
