const Folder = require('../../models/Folder');

/**
 * @desc    Get breadcrumbs / path from root to folder
 * @route   GET /folders/:id/path
 */
const getFolderPath = async (req, res) => {
  try {
    const folderId = req.params.id;
    const path = [];

    let current = await Folder.findById(folderId).lean();
    if (!current) return res.status(404).json({ error: 'Folder not found' });

    while (current) {
      path.unshift({ _id: current._id, name: current.name });
      if (!current.parent_id) break;
      current = await Folder.findById(current.parent_id).lean();
    }

    res.json(path);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = getFolderPath;
