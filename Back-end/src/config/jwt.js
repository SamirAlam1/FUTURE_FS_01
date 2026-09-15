const jwt = require('jsonwebtoken')

const ALGORITHM = 'HS256'
const MIN_SECRET_LEN = 32 // 256-bit minimum for HS256

const getSecret = () => {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is not set')
  if (s.length < MIN_SECRET_LEN)
    throw new Error(`JWT_SECRET must be at least ${MIN_SECRET_LEN} characters`)
  return s
}

const sign = (payload) =>
  jwt.sign(payload, getSecret(), {
    algorithm: ALGORITHM,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })

const verify = (token) =>
  jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] })

module.exports = { sign, verify }
