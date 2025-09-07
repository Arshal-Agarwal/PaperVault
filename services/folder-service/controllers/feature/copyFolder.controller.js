const Folder = require('../../models/Folder');

/**
 * @desc    Copy a folder and its subtree to a new parent
 * @route   POST /folders/copy/:id
 * @body    { newParentId }
 */
const copyFolder = async (req, res) => {
  try {
    const folderId = req.params.id;
    const { newParentId } = req.body;

    const folder = await Folder.findById(folderId).lean();
    if (!folder) return res.status(404).json({ error: 'Folder not found' });

    // Recursive function to copy folder and its children
    const copyRecursive = async (f, parentId) => {
      const newFolder = new Folder({
        name: f.name,
        parent_id: parentId || null,
        user_id: f.user_id,
        undeletable: false
      });
      await newFolder.save();

      if (f.children && f.children.length > 0) {
        for (let childId of f.children) {
          const child = await Folder.findById(childId).lean();
          if (child) {
            const copiedChild = await copyRecursive(child, newFolder._id);
            newFolder.children.push(copiedChild._id);
          }
        }
        await newFolder.save();
      }

      return newFolder;
    };

    const newFolderTree = await copyRecursive(folder, newParentId || null);

    res.json({ message: 'Folder copied successfully', newFolderTree });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = copyFolder;
