// routes/projects.js — FIXED
const express = require('express');
const router  = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { validateProject, validateObjectId } = require('../middleware/validate');

router.route('/')
  .get(getProjects)
  .post(protect, validateProject, createProject);   // FIX: validate before create

router.route('/:id')
  .get(validateObjectId, getProject)                // FIX: validate ID param
  .put(protect, validateObjectId, validateProject, updateProject)
  .delete(protect, validateObjectId, deleteProject);

module.exports = router;
