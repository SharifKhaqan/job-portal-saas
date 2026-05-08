const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");

exports.getAdminStats = async (_req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCandidates,
      totalEmployers
    ] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ role: "candidate" }),
      User.countDocuments({ role: "employer" })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCandidates,
        totalEmployers
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load admin stats" });
  }
};

exports.getAdminUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .select("name email role isBlocked createdAt")
      .sort({ createdAt: -1 });

    res.json({
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: Boolean(user.isBlocked)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load users" });
  }
};

exports.deleteAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete user" });
  }
};

exports.blockAdminUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: Boolean(user.isBlocked)
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Could not block user" });
  }
};

exports.getAdminJobs = async (_req, res) => {
  try {
    const jobs = await Job.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({
      jobs: jobs.map((job) => ({
        id: job._id,
        title: job.title,
        location: job.location,
        employer: job.postedBy
          ? {
              id: job.postedBy._id,
              name: job.postedBy.name,
              email: job.postedBy.email
            }
          : null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load jobs" });
  }
};

exports.deleteAdminJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    await Job.deleteOne({ _id: job._id });

    res.json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete job" });
  }
};

exports.getAdminApplications = async (_req, res) => {
  try {
    const applications = await Application.find()
      .populate("candidateId", "name email resume isBlocked")
      .populate("jobId", "title")
      .sort({ createdAt: -1 });

    res.json({
      applications: applications.map((application) => ({
        id: application._id,
        status: application.status,
        createdAt: application.createdAt,
        candidate: application.candidateId
          ? {
              id: application.candidateId._id,
              name: application.candidateId.name,
              email: application.candidateId.email,
              resume: application.candidateId.resume || "",
              isBlocked: Boolean(application.candidateId.isBlocked)
            }
          : null,
        job: application.jobId
          ? {
              id: application.jobId._id,
              title: application.jobId.title
            }
          : null
      }))
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load applications" });
  }
};

exports.deleteAdminApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    await Application.deleteOne({ _id: application._id });

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Could not delete application" });
  }
};
