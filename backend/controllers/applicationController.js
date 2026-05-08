const Application = require("../models/Application");
const Job = require("../models/Job");

exports.getApplicationsForEmployer = async (req, res) => {
  try {
    // Employers can review applications only for jobs they posted.
    const myJobDocs = await Job.find({ postedBy: req.user.id })
      .select("_id")
      .lean();

    const jobIds = myJobDocs.map((j) => j._id);

    if (jobIds.length === 0) {
      return res.json({ applications: [] });
    }

    const rows = await Application.find({ jobId: { $in: jobIds } })
      .populate("jobId", "title location")
      .populate("candidateId", "name email phone resume")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      applications: rows.map((doc) => ({
        id: doc._id,
        status: doc.status,
        createdAt: doc.createdAt,
        job: doc.jobId
          ? {
              id: doc.jobId._id,
              title: doc.jobId.title,
              location: doc.jobId.location
            }
          : null,
        candidate: doc.candidateId
          ? {
              id: doc.candidateId._id,
              name: doc.candidateId.name,
              email: doc.candidateId.email,
              phone: doc.candidateId.phone || "",
              resume: doc.candidateId.resume || ""
            }
          : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["shortlisted", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be shortlisted or rejected" });
    }

    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const job = await Job.findById(application.jobId).select("postedBy");
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Re-check ownership here so employers cannot update another job's applicants.
    if (String(job.postedBy) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to update this application" });
    }

    application.status = status;
    await application.save();

    return res.json({
      application: {
        id: application._id,
        status: application.status
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const existing = await Application.findOne({
      candidateId: req.user.id,
      jobId
    });

    // One application per candidate per job keeps dashboard counts accurate.
    if (existing) {
      return res
        .status(400)
        .json({ message: "You have already applied to this job" });
    }

    const app = await Application.create({
      candidateId: req.user.id,
      jobId,
      status: "applied"
    });

    const populated = await Application.findById(app._id)
      .populate("jobId", "title location")
      .lean();

    res.status(201).json({
      application: {
        id: populated._id,
        status: populated.status,
        createdAt: populated.createdAt,
        job: populated.jobId
          ? {
              id: populated.jobId._id,
              title: populated.jobId.title,
              location: populated.jobId.location
            }
          : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const rows = await Application.find({ candidateId: req.user.id })
      .populate("jobId", "title location")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      applications: rows.map((doc) => ({
        id: doc._id,
        status: doc.status,
        createdAt: doc.createdAt,
        job: doc.jobId
          ? {
              id: doc.jobId._id,
              title: doc.jobId.title,
              location: doc.jobId.location
            }
          : null
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
