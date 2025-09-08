const Paper = require('../models/Paper');
const { uploadPDFFromBuffer } = require('../services/cloudinaryService');
const cloudinary = require('../config/cloudinary');

// ✅ Update only the PDF file
async function updatePaperFile(req, res) {
  try {
    const { paper_id } = req.params;
    const paper = await Paper.findById(paper_id);

    if (!paper) return res.status(404).json({ error: 'Paper not found' });
    if (!req.file || !req.file.buffer)
      return res.status(400).json({ error: 'No file uploaded' });

    // Delete old Cloudinary file
    await cloudinary.uploader.destroy(paper.cloudinary_public_id, {
      resource_type: 'raw',
    });

    // Upload new file
    const result = await uploadPDFFromBuffer(req.file.buffer, req.file.originalname);

    // Update file info + reset dependent fields
    paper.file_url = result.url;
    paper.cloudinary_public_id = result.public_id;
    paper.title = req.body.title || req.file.originalname;
    
    // Reset AI-dependent info
    paper.metadata = null;
    paper.tags = [];
    paper.ai_status = 'pending';
    paper.rating = { avg: 0, count: 0 };

    const updatedPaper = await paper.save();

    res.status(200).json({
      message: 'Paper file updated successfully',
      paper: updatedPaper,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update paper file' });
  }
}

module.exports = { updatePaperFile };
