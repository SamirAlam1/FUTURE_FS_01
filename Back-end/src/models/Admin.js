const { Schema, model } = require('mongoose')
const bcrypt = require('bcryptjs')

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    // Used to invalidate JWTs issued before a password change.
    // Tokens whose iat < passwordChangedAt are rejected.
    passwordChangedAt: {
      type: Date,
      select: false,
      default: null,
    },
  },
  { timestamps: true },
)

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  // Bump passwordChangedAt whenever the password field changes
  // (but not on the very first save, where there's no prior token to invalidate)
  if (!this.isNew) {
    // Subtract 1 s to guard against the edge case where the token is
    // signed in the same second the password is changed
    this.passwordChangedAt = new Date(Date.now() - 1000)
  }
  next()
})

// Compare plain password against stored hash
adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Returns true when the supplied JWT iat (seconds) is older than the last
// password change, meaning the token should be rejected.
adminSchema.methods.passwordChangedAfter = function (jwtIat) {
  if (!this.passwordChangedAt) return false
  const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000)
  return jwtIat < changedAt
}

// Strip sensitive fields from all JSON output
adminSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.passwordChangedAt
  return obj
}

module.exports = model('Admin', adminSchema)
