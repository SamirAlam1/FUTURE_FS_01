/**
 * Seed script — creates the initial admin user.
 * Run once after setting up your .env file:
 *   node src/seed.js
 *
 * Credentials are read from environment variables only — never hardcoded.
 */
require('dotenv').config()
const connectDB = require('./config/db')
const Admin = require('./models/Admin')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Same complexity rule enforced in authController for change-password
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

const seed = async () => {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.error('✗ Set ADMIN_EMAIL and ADMIN_PASSWORD in your .env file before running seed')
    process.exit(1)
  }
  if (!EMAIL_REGEX.test(email)) {
    console.error(`✗ ADMIN_EMAIL "${email}" is not a valid email address`)
    process.exit(1)
  }
  // Enforce the same complexity rule as change-password (L-2 fix for seed)
  if (!PASSWORD_REGEX.test(password)) {
    console.error('✗ ADMIN_PASSWORD must be at least 8 characters and contain uppercase, lowercase, and a digit')
    process.exit(1)
  }

  await connectDB()

  const exists = await Admin.findOne({ email: email.toLowerCase() })
  if (exists) {
    console.log(`ℹ Admin "${email}" already exists — skipping. Use change-password API to update credentials.`)
    process.exit(0)
  }

  await Admin.create({ email: email.toLowerCase(), password })
  console.log(`✓ Admin created: ${email.toLowerCase()}`)
  console.log('  You can now start the server and sign in at /admin/login')
  process.exit(0)
}

seed().catch(err => {
  console.error('✗ Seed failed:', err.message)
  process.exit(1)
})
