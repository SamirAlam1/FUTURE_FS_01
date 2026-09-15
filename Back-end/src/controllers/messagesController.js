const { Message } = require('../models/index')

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SAFE_IP    = /^[\d.:a-fA-F]+$/

// Strip HTML tags — prevents stored XSS when admin views messages
const stripHtml = (s) => s.replace(/<[^>]*>/g, '').replace(/[<>]/g, '')

// POST /api/contact — public (rate-limited in server.js)
const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body

    const missing = ['name', 'email', 'subject', 'message'].filter(f => !req.body[f]?.trim?.())
    if (missing.length)
      return res.status(400).json({ success: false, message: `Missing required fields: ${missing.join(', ')}` })

    if (
      typeof name !== 'string' || typeof email !== 'string' ||
      typeof subject !== 'string' || typeof message !== 'string'
    ) return res.status(400).json({ success: false, message: 'Invalid field types' })

    if (name.trim().length    > 100)  return res.status(400).json({ success: false, message: 'Name too long (max 100)' })
    if (subject.trim().length > 200)  return res.status(400).json({ success: false, message: 'Subject too long (max 200)' })
    if (message.trim().length > 5000) return res.status(400).json({ success: false, message: 'Message too long (max 5000)' })
    if (message.trim().length < 10)   return res.status(400).json({ success: false, message: 'Message too short (min 10)' })
    if (!EMAIL_REGEX.test(email.trim()))
      return res.status(400).json({ success: false, message: 'Invalid email address' })

    const rawIp = req.ip || ''

    await Message.create({
      name:    stripHtml(name.trim()),
      email:   email.trim().toLowerCase(),
      subject: stripHtml(subject.trim()),
      message: stripHtml(message.trim()),
      ip:      SAFE_IP.test(rawIp) ? rawIp.slice(0, 45) : '',
    })

    res.status(201).json({ success: true, message: 'Message received — thank you!' })
  } catch (err) { next(err) }
}

// GET /api/admin/messages — protected, paginated
const getMessages = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1)
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20))
    const skip  = (page - 1) * limit

    const [msgs, total] = await Promise.all([
      Message.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Message.countDocuments({}),
    ])

    res.json({ success: true, count: msgs.length, total, page, pages: Math.ceil(total / limit), data: msgs })
  } catch (err) { next(err) }
}

// PATCH /api/admin/messages/:id/read — protected
const markRead = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true, runValidators: false })
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' })
    res.json({ success: true, data: msg })
  } catch (err) { next(err) }
}

// DELETE /api/admin/messages/:id — protected
const deleteMessage = async (req, res, next) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' })
    res.json({ success: true, message: 'Message deleted' })
  } catch (err) { next(err) }
}

module.exports = { submitContact, getMessages, markRead, deleteMessage }
