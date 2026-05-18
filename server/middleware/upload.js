const multer = require('multer');

// Store files in memory buffer instead of writing them to disk
const storage = multer.memoryStorage();

// Accept CSV and JSON files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
  
  if (allowedTypes.includes(file.mimetype) || 
      file.originalname.endsWith('.csv') || 
      file.originalname.endsWith('.json')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only CSV and JSON files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

module.exports = upload;
