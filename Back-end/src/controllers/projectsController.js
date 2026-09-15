const Project = require('../models/Project')

const ALLOWED_FIELDS = [
  'title', 'description', 'techStack', 'category',
  'year', 'featured', 'liveUrl', 'githubUrl', 'image',
  'highlights', 'order',
]
const VALID_CATEGORIES = ['Full-Stack', 'Frontend', 'Backend', 'Other']

const pick = (body) => {
  const out = {}
  for (const k of ALLOWED_FIELDS)
    if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k]
  return out
}

// GET /api/projects — public
const getProjects = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.category && req.query.category !== 'All') {
      if (!VALID_CATEGORIES.includes(req.query.category))
        return res.status(400).json({ success: false, message: 'Invalid category' })
      filter.category = req.query.category
    }
    if (req.query.featured === 'true') filter.featured = true

    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 })
    res.json({ success: true, count: projects.length, data: projects })
  } catch (err) { next(err) }
}

// GET /api/projects/:id — public
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (err) { next(err) }
}

// POST /api/admin/projects — protected
const createProject = async (req, res, next) => {
  try {
    const project = await Project.create(pick(req.body))
    res.status(201).json({ success: true, data: project })
  } catch (err) { next(err) }
}

// PUT /api/admin/projects/:id — protected
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true })
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, data: project })
  } catch (err) { next(err) }
}

// DELETE /api/admin/projects/:id — protected
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' })
    res.json({ success: true, message: 'Project deleted' })
  } catch (err) { next(err) }
}

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject }
