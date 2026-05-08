const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const requireEmployer = require("../middleware/requireEmployer");
const { getAllJobs, createJob, deleteJob } = require("../controllers/jobController");

router.get("/", optionalAuthMiddleware, getAllJobs);
router.post("/", authMiddleware, requireEmployer, createJob);
router.delete("/:id", authMiddleware, requireEmployer, deleteJob);

module.exports = router;
