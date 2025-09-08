// routes/crud.route.js.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const downloadController = require('../controllers/downloadController');
const deleteController = require('../controllers/deleteController');
const updateController = require('../controllers/updateController')
const updateFileController = require('../controllers/updateFileController')

const storage = multer.memoryStorage(); // store file in buffer
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadController.uploadPDF);
router.get('/download/:paper_id', downloadController.downloadPDF);
router.delete('/delete/:paper_id', deleteController.deletePDF);
router.patch('/update/:paper_id',updateController.updatePaperInfo)
router.patch('/updateFile/:paper_id',upload.single('file'),updateController.updatePaperInfo)

module.exports = router;
