const getFolderById = require("../controllers/crud/getFolderById.controller");
const getFolderTreeByUser = require("../controllers/crud/getFolderTreeByUser.controller");
const createFolder  = require('../controllers/crud/createFolder.controller')
const softDeleteFolder = require('../controllers/crud/softDeleteFolder.cotroller')
const hardDeleteFolder = require('../controllers/crud/hardDeleteFolder.cotroller')
const moveFolder = require("../controllers/crud/moveFolder.controller");
const renameFolder = require("../controllers/crud/renameFolder.controller");
const router = require('express').Router()

router.get('/getFolderById/:id',getFolderById)
router.get('/getFolderTreeByUser/:userId',getFolderTreeByUser)
router.post('/create' , createFolder)
router.patch("/move/:id", moveFolder);
router.patch("/rename/:id", renameFolder);
router.delete('/softDelete/:id',softDeleteFolder)
router.delete('/hardDelete/:id',hardDeleteFolder)

module.exports  = router