// controllers/deleteController.js
const Paper = require('../models/Paper');
const cloudinary = require('../config/cloudinary');

async function deletePDF(req, res) {
  try {
    const { paper_id } = req.params;

    if (!paper_id) {
      return res.status(400).json({ error: 'paper_id is required' });
    }

    const paper = await Paper.findById(paper_id);
    if (!paper) {
      return res.status(404).json({ error: 'Paper not found' });
    }

    if (!paper.cloudinary_public_id) {
      return res.status(400).json({ error: 'Missing Cloudinary public_id' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(paper.cloudinary_public_id, {
      resource_type: 'raw', // Important for PDFs
    });

    // Delete from MongoDB
    await Paper.findByIdAndDelete(paper_id);

    res.status(200).json({
      message: 'PDF deleted successfully',
      paper_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
}

module.exports = { deletePDF };
