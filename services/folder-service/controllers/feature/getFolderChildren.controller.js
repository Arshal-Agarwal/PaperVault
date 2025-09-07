const Folder = require('../../models/Folder');

/**
 * @desc    Get direct children of a folder
 * @route   GET /folders/:id/children
 */
const getFolderChildren = async (req, res) => {
  try {
    const folderId = req.params.id;
    const children = await Folder.find({ parent_id: folderId }).lean();
    res.json(children);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = getFolderChildren;
