// controllers/uploadController.js
const Paper = require('../models/Paper');
const { uploadPDFFromBuffer } = require('../services/cloudinaryService');

async function uploadPDF(req, res) {
  try {
    if (!req.file || !req.file.buffer)
      return res.status(400).json({ error: 'No file uploaded' });

    const { folder_id, user_id, title } = req.body;
    if (!folder_id || !user_id)
      return res.status(400).json({ error: '`folder_id` and `user_id` are required.' });

    const result = await uploadPDFFromBuffer(req.file.buffer, req.file.originalname);

    const newPaper = new Paper({
      title: title || req.file.originalname,
      folder_id,
      user_id,
      file_url: result.url,
      cloudinary_public_id: result.public_id,
      metadata: null, // AI will fill later
      tags: [],
      ai_status: 'pending',
    });

    const savedPaper = await newPaper.save();

    res.status(201).json({
      message: 'PDF uploaded and saved successfully',
      paper: savedPaper,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload PDF' });
  }
}

module.exports = { uploadPDF };
