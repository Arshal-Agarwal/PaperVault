const axios = require('axios');
const Paper = require('../models/Paper');

async function downloadPDF(req, res) {
  try {
    const { paper_id } = req.params;
    const paper = await Paper.findById(paper_id);

    if (!paper) return res.status(404).json({ error: 'Paper not found' });

    // Stream PDF from Cloudinary to user
    const response = await axios({
      method: 'get',
      url: paper.file_url, // public PDF URL
      responseType: 'stream',
    });

    res.setHeader('Content-Disposition', `attachment; filename="${paper.title}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    response.data.pipe(res);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to download PDF' });
  }
}

module.exports = { downloadPDF };
