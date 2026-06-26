const Certification = require('../models/Certification');

// @desc    Get all certifications
// @route   GET /api/certifications
// @access  Public
const getCertifications = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.featured = true;

    const certifications = await Certification.find(filter).sort({ order: 1, issueDate: -1 });
    res.status(200).json({ success: true, count: certifications.length, data: certifications });
  } catch (error) { next(error); }
};

// @desc    Get single certification
// @route   GET /api/certifications/:id
// @access  Public
const getCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findById(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });
    res.status(200).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

// @desc    Create certification
// @route   POST /api/certifications
// @access  Private (admin)
const createCertification = async (req, res, next) => {
  try {
    const {
      title, organization, category, issueDate, expiryDate,
      credentialId, credentialUrl, certificateImage, skills,
      description, featured, order,
    } = req.body;

    const cert = await Certification.create({
      title, organization, category, issueDate, expiryDate,
      credentialId, credentialUrl, certificateImage, skills,
      description, featured, order,
    });
    res.status(201).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

// @desc    Update certification
// @route   PUT /api/certifications/:id
// @access  Private (admin)
const updateCertification = async (req, res, next) => {
  try {
    const {
      title, organization, category, issueDate, expiryDate,
      credentialId, credentialUrl, certificateImage, skills,
      description, featured, order,
    } = req.body;

    const cert = await Certification.findByIdAndUpdate(
      req.params.id,
      {
        title, organization, category, issueDate, expiryDate,
        credentialId, credentialUrl, certificateImage, skills,
        description, featured, order,
      },
      { new: true, runValidators: true }
    );
    if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });
    res.status(200).json({ success: true, data: cert });
  } catch (error) { next(error); }
};

// @desc    Delete certification
// @route   DELETE /api/certifications/:id
// @access  Private (admin)
const deleteCertification = async (req, res, next) => {
  try {
    const cert = await Certification.findByIdAndDelete(req.params.id);
    if (!cert) return res.status(404).json({ success: false, message: 'Certification not found' });
    res.status(200).json({ success: true, message: 'Certification deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = {
  getCertifications,
  getCertification,
  createCertification,
  updateCertification,
  deleteCertification,
};
