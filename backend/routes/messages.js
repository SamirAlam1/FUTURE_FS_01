// routes/messages.js
const express  = require('express');
const router   = express.Router();
const { createMessage, getMessages, toggleRead, deleteMessage } = require('../controllers/messageController');
const { protect }         = require('../middleware/auth');
const { validateMessage, validateObjectId } = require('../middleware/validate');

// POST /api/messages — public (contact form)
// FIX: Added validateMessage to sanitize + validate all fields before saving to DB
router.post('/', validateMessage, createMessage);

// GET /api/messages — private (admin only)
router.get('/', protect, getMessages);

// PUT /api/messages/:id/read — private
// FIX: validateObjectId prevents CastError from malformed IDs and param injection
router.put('/:id/read', protect, validateObjectId, toggleRead);

// DELETE /api/messages/:id — private
router.delete('/:id', protect, validateObjectId, deleteMessage);

module.exports = router;
