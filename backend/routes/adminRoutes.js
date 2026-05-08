const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/requireAdmin");
const {
  blockAdminUser,
  deleteAdminApplication,
  deleteAdminJob,
  deleteAdminUser,
  getAdminApplications,
  getAdminJobs,
  getAdminStats,
  getAdminUsers
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", authMiddleware, requireAdmin, getAdminStats);
router.get("/users", authMiddleware, requireAdmin, getAdminUsers);
router.delete("/users/:id", authMiddleware, requireAdmin, deleteAdminUser);
router.put("/users/:id/block", authMiddleware, requireAdmin, blockAdminUser);
router.get("/jobs", authMiddleware, requireAdmin, getAdminJobs);
router.delete("/jobs/:id", authMiddleware, requireAdmin, deleteAdminJob);
router.get(
  "/applications",
  authMiddleware,
  requireAdmin,
  getAdminApplications
);
router.delete(
  "/applications/:id",
  authMiddleware,
  requireAdmin,
  deleteAdminApplication
);

module.exports = router;
