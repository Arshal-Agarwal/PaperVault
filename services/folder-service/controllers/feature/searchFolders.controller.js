const Folder = require('../../models/Folder');

/**
 * @desc    Search folders by name for a user
 * @route   GET /folders/search?userId=...&query=...
 */
const searchFolders = async (req, res) => {
  try {
    const { userId, query } = req.query;
    if (!userId || !query) return res.status(400).json({ error: 'userId and query required' });

    const folders = await Folder.find({
      user_id: userId,
      name: { $regex: query, $options: 'i' }
    }).lean();

    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = searchFolders;
