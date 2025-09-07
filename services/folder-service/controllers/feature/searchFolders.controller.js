const Folder = require('../../models/Folder');
const { getCache, setCache } = require('../../utils/cache');

/**
 * @desc    Search folders by name for a user
 * @route   GET /api/folders/search?userId=...&query=...
 */
const searchFolders = async (req, res) => {
  try {
    const { userId, query } = req.query;
    if (!userId || !query) {
      return res.status(400).json({ error: 'userId and query required' });
    }

    const cacheKey = `folderSearch:${userId}:${query.toLowerCase()}`;

    // ✅ 1. Check cache
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // ❌ 2. Query DB
    const folders = await Folder.find({
      user_id: userId,
      name: { $regex: query, $options: 'i' }
    }).lean();

    // ✅ 3. Cache result (shorter TTL since searches can change often)
    await setCache(cacheKey, JSON.stringify(folders), 120); // 2 min

    res.json(folders);
  } catch (err) {
    console.error("❌ searchFolders error:", err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = searchFolders;
