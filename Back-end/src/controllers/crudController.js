/**
 * Generic CRUD controller factory with per-model field whitelisting.
 * Prevents mass-assignment on all admin write routes.
 */

const ALLOWED = {
  Skill:         ['name', 'category', 'proficiency', 'order'],
  Education:     ['institution', 'degree', 'field', 'board', 'startYear', 'endYear', 'grade', 'description', 'order'],
  Experience:    ['company', 'role', 'type', 'startDate', 'endDate', 'location', 'description', 'highlights', 'order'],
  Certification: ['title', 'issuer', 'date', 'credentialUrl', 'order'],
}

const pick = (modelName, body) => {
  const fields = ALLOWED[modelName]
  if (!fields) {
    console.error(`[SECURITY] No ALLOWED fields defined for model: ${modelName}`)
    return {}
  }
  const out = {}
  for (const k of fields)
    if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k]
  return out
}

const crudController = (Model) => {
  const name = Model.modelName

  return {
    getAll: async (_req, res, next) => {
      try {
        const data = await Model.find({}).sort({ order: 1, createdAt: -1 })
        res.json({ success: true, count: data.length, data })
      } catch (err) { next(err) }
    },

    getOne: async (req, res, next) => {
      try {
        const doc = await Model.findById(req.params.id)
        if (!doc) return res.status(404).json({ success: false, message: `${name} not found` })
        res.json({ success: true, data: doc })
      } catch (err) { next(err) }
    },

    create: async (req, res, next) => {
      try {
        const doc = await Model.create(pick(name, req.body))
        res.status(201).json({ success: true, data: doc })
      } catch (err) { next(err) }
    },

    update: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndUpdate(req.params.id, pick(name, req.body), { new: true, runValidators: true })
        if (!doc) return res.status(404).json({ success: false, message: `${name} not found` })
        res.json({ success: true, data: doc })
      } catch (err) { next(err) }
    },

    remove: async (req, res, next) => {
      try {
        const doc = await Model.findByIdAndDelete(req.params.id)
        if (!doc) return res.status(404).json({ success: false, message: `${name} not found` })
        res.json({ success: true, message: `${name} deleted` })
      } catch (err) { next(err) }
    },
  }
}

module.exports = crudController
