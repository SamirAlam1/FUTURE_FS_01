const express = require('express')
const { login, logout, getMe, changePassword }                         = require('../controllers/authController')
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectsController')
const { submitContact, getMessages, markRead, deleteMessage }           = require('../controllers/messagesController')
const crudController                                                    = require('../controllers/crudController')
const { Skill, Education, Experience, Certification }                   = require('../models')
const { protect }                                                       = require('../middleware/auth')

const router = express.Router()

// ── Auth ──────────────────────────────────────────────────────
router.post('/auth/login',           login)
// W2 fix: logout does NOT require protect middleware.
// If the JWT has already expired, protect would reject the request with 401
// and clearAuthCookie would never fire — leaving the expired (but harmless) cookie set.
// Removing protect means the cookie is always cleared when the user clicks Sign Out,
// regardless of token expiry state. The logout handler is safe without protect:
// it only clears a cookie, performs no sensitive data operation, and has no CSRF risk
// because it is called with credentials:'include' from our own origin only.
router.post('/auth/logout',          logout)
router.get ('/auth/me',     protect, getMe)
router.post('/auth/change-password', protect, changePassword)

// ── Public: Projects ──────────────────────────────────────────
router.get('/projects',     getProjects)
router.get('/projects/:id', getProject)

// ── Admin: Projects ───────────────────────────────────────────
router.post  ('/admin/projects',     protect, createProject)
router.put   ('/admin/projects/:id', protect, updateProject)
router.delete('/admin/projects/:id', protect, deleteProject)

// ── Public + Admin: generic resources ─────────────────────────
const resource = (path, Model) => {
  const ctrl = crudController(Model)
  router.get   (`/${path}`,              ctrl.getAll)
  router.get   (`/${path}/:id`,          ctrl.getOne)
  router.post  (`/admin/${path}`,        protect, ctrl.create)
  router.put   (`/admin/${path}/:id`,    protect, ctrl.update)
  router.delete(`/admin/${path}/:id`,    protect, ctrl.remove)
}

resource('skills',         Skill)
resource('education',      Education)
resource('experience',     Experience)
resource('certifications', Certification)

// ── Contact ───────────────────────────────────────────────────
router.post('/contact', submitContact)

// ── Admin: Messages ───────────────────────────────────────────
router.get   ('/admin/messages',          protect, getMessages)
router.patch ('/admin/messages/:id/read', protect, markRead)
router.delete('/admin/messages/:id',      protect, deleteMessage)

module.exports = router
