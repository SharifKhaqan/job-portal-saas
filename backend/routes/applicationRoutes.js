const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const requireEmployer = require("../middleware/requireEmployer");
const {
  createApplication,
  getMyApplications,
  getApplicationsForEmployer,
  updateApplicationStatus
} = require("../controllers/applicationController");

function requireCandidate(req, res, next) {
  if (req.user?.role !== "candidate") {
    return res.status(403).json({ message: "Only candidates can access this" });
  }
  next();
}

router.get("/my", authMiddleware, requireCandidate, getMyApplications);
router.get(
  "/for-my-jobs",
  authMiddleware,
  requireEmployer,
  getApplicationsForEmployer
);
router.patch(
  "/:id/status",
  authMiddleware,
  requireEmployer,
  updateApplicationStatus
);
router.post("/", authMiddleware, requireCandidate, createApplication);

module.exports = router;
