const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload route
router.post('/upload-excel', upload.single('excelFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully', file: req.file });
});

// List all uploaded Excel files
router.get('/excel-files', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to read files' });
    }
    // File details with name, size, and upload date
    const fileDetails = files.map(file => {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      return {
        _id: file, // using filename as id
        originalName: file.split('-').slice(1).join('-'), // remove timestamp
        size: stats.size,
        uploadDate: stats.birthtime
      };
    });
    res.json(fileDetails);
  });
});

// Download Excel file
router.get('/download-excel/:fileId', (req, res) => {
  const fileName = req.params.fileId;
  const filePath = path.join(uploadDir, fileName);
  if (fs.existsSync(filePath)) {
    res.download(filePath, fileName.split('-').slice(1).join('-'));
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Delete Excel file
router.delete('/delete-excel/:fileId', (req, res) => {
  const fileName = req.params.fileId;
  const filePath = path.join(uploadDir, fileName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: 'File deleted successfully' });
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

// Get latest Excel file for frontend
router.get('/latest-excel-file', (req, res) => {
  fs.readdir(uploadDir, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Unable to read files' });
    }
    // Filter for Excel files
    const excelFiles = files.filter(file =>
      file.toLowerCase().endsWith('.xlsx') ||
      file.toLowerCase().endsWith('.xls')
    );
    if (excelFiles.length === 0) {
      return res.status(404).json({ message: 'No Excel files found' });
    }
    // Get the most recent file (by timestamp in filename)
    const latestFile = excelFiles.sort().pop();
    const filePath = path.join(uploadDir, latestFile);
    if (fs.existsSync(filePath)) {
      res.download(filePath, latestFile.split('-').slice(1).join('-'));
    } else {
      res.status(404).json({ message: 'Latest file not found' });
    }
  });
});

module.exports = router;