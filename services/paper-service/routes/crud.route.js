// routes/crud.route.js.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const downloadController = require('../controllers/downloadController');

const storage = multer.memoryStorage(); // store file in buffer
const upload = multer({ storage });

router.post('/upload', upload.single('file'), uploadController.uploadPDF);
router.get('/download/:paper_id', downloadController.downloadPDF);

module.exports = router;
