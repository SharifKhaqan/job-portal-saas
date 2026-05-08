const express = require("express");
const router = express.Router();
const { updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.put(
  "/profile",
  authMiddleware,
  upload.single("resume"),
  updateProfile
);

module.exports = router;
