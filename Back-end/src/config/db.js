const mongoose = require('mongoose')

const connectDB = async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not defined in environment variables')

  if (
    process.env.NODE_ENV === 'production' &&
    !uri.includes('tls=true') &&
    !uri.startsWith('mongodb+srv://')
  ) {
    console.warn('[WARN] MongoDB connection in production should use TLS (mongodb+srv:// or tls=true)')
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
  })

  // Don't expose host topology in production logs
  if (process.env.NODE_ENV !== 'production') {
    console.log(`MongoDB connected: ${mongoose.connection.host}`)
  } else {
    console.log('MongoDB connected')
  }
}

module.exports = connectDB
