const fs = require("fs");
const path = require("path");
const multer = require("multer");

const resumesDir = path.join(__dirname, "..", "uploads", "resumes");

// Ensure local resume storage exists before multer receives the first upload.
fs.mkdirSync(resumesDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (_req, file, cb) => {
  // Keep uploads limited to resume document formats only.
  const allowedMimeTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only PDF and Word documents are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // Prevent very large files from filling local storage.
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
