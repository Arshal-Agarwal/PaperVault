const Paper = require('../models/Paper');

// ✅ Update only paper info (no file changes)
async function updatePaperInfo(req, res) {
  try {
    const { paper_id } = req.params;
    const updateData = { ...req.body };

    // Prevent file_url and cloudinary_public_id changes here
    delete updateData.file_url;
    delete updateData.cloudinary_public_id;

    const updatedPaper = await Paper.findByIdAndUpdate(
      paper_id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedPaper) return res.status(404).json({ error: 'Paper not found' });

    res.status(200).json({
      message: 'Paper info updated successfully',
      paper: updatedPaper,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update paper info' });
  }
}

module.exports = { updatePaperInfo };
