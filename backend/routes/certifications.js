const express = require('express');
const router  = express.Router();
const {
  getCertifications, getCertification,
  createCertification, updateCertification, deleteCertification,
} = require('../controllers/certificationController');
const { protect }         = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validate');

router.route('/')
  .get(getCertifications)
  .post(protect, createCertification);

router.route('/:id')
  .get(validateObjectId, getCertification)
  .put(protect, validateObjectId, updateCertification)
  .delete(protect, validateObjectId, deleteCertification);

module.exports = router;
