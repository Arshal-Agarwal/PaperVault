const router = require('express').Router();

const getFolderChildren = require('../controllers/feature/getFolderChildren.controller');
const searchFolders = require('../controllers/feature/searchFolders.controller');
const getFolderPath = require('../controllers/feature/getFolderPath.controller');
const copyFolder = require('../controllers/feature/copyFolder.controller');

// Get direct children of a folder
router.get('/:id/children', getFolderChildren);

// Search folders by name (query param: userId + query)
router.get('/search', searchFolders);

// Get breadcrumbs / folder path
router.get('/:id/path', getFolderPath);

// Copy folder and its subtree
router.post('/copy/:id', copyFolder);

module.exports = router;
