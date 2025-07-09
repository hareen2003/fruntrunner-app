const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const orderId = req.body.orderId;
    const dir = path.join(__dirname, '../uploads', orderId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Upload shipping documents
router.post('/upload', authMiddleware, upload.array('files'), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No files uploaded' });
  }
  res.json({ success: true, message: 'Documents uploaded successfully', files: req.files });
});

// (Optional) List uploaded documents for an order
router.get('/:orderId', authMiddleware, (req, res) => {
  const orderId = req.params.orderId;
  const dir = path.join(__dirname, '../uploads', orderId);
  if (!fs.existsSync(dir)) {
    return res.json({ success: true, files: [] });
  }
  const files = fs.readdirSync(dir).map(filename => ({
    filename,
    url: `/uploads/${orderId}/${filename}`
  }));
  res.json({ success: true, files });
});

module.exports = router;
