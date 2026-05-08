const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const {
  cosineSimilarity,
  ensureJobEmbedding,
  ensureUserEmbedding,
  getMatchedSkills,
  matchScoreFromSimilarity,
  skillMatchScore
} = require("../utils/recommendation");

function serializeJob(job, recommendation = {}) {
  return {
    id: job._id,
    title: job.title,
    description: job.description,
    location: job.location,
    skills: job.skills,
    companyName: job.companyName,
    companyLocation: job.companyLocation,
    lastDateToApply: job.lastDateToApply,
    postedAt: job.postedAt || job.createdAt,
    postedBy: job.postedBy
      ? {
          id: job.postedBy._id,
          name: job.postedBy.name
        }
      : null,
    isRecommended: Boolean(recommendation.isRecommended),
    matchScore: Number(recommendation.matchScore) || 0,
    matchedSkills: Array.isArray(recommendation.matchedSkills)
      ? recommendation.matchedSkills
      : []
  };
}

function parseJobDate(value) {
  if (typeof value === "string") {
    // Date inputs send YYYY-MM-DD; construct it locally to avoid UTC day shifts.
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      return new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3])
      );
    }
  }

  return new Date(value);
}

function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date.getTime() > today.getTime();
}

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      skills,
      companyName,
      companyLocation,
      lastDateToApply
    } = req.body;

    if (!title?.trim() || !description?.trim() || !location?.trim()) {
      return res.status(400).json({
        message: "Title, description, and location are required"
      });
    }

    const parsedLastDate = parseJobDate(lastDateToApply);
    if (!lastDateToApply || Number.isNaN(parsedLastDate.getTime())) {
      return res.status(400).json({
        message: "A valid last date to apply is required"
      });
    }

    if (!isFutureDate(parsedLastDate)) {
      return res.status(400).json({
        message: "Please select a valid date."
      });
    }

    let skillArray = [];
    if (Array.isArray(skills)) {
      skillArray = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === "string") {
      skillArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const job = await Job.create({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      skills: skillArray,
      companyName: companyName?.trim() || "",
      companyLocation: companyLocation?.trim() || "",
      lastDateToApply: parsedLastDate,
      postedBy: req.user.id
    });

    await ensureJobEmbedding(job);

    const populated = await Job.findById(job._id).populate("postedBy", "name");

    res.status(201).json({
      job: serializeJob(populated)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const query = {};
    const isCandidate = req.user?.role === "candidate";
    let user = null;
    let userEmbedding = [];

    if (isCandidate) {
      // Hide jobs the candidate has already applied to from the browse list.
      const appliedRows = await Application.find({ candidateId: req.user.id })
        .select("jobId")
        .lean();
      const appliedJobIds = appliedRows.map((row) => row.jobId).filter(Boolean);

      if (appliedJobIds.length > 0) {
        query._id = { $nin: appliedJobIds };
      }

      user = await User.findById(req.user.id);
      if (user) {
        userEmbedding = await ensureUserEmbedding(user);
      }
    }

    const jobs = await Job.find(query)
      .populate("postedBy", "name")
      .sort({ createdAt: -1 });

    const serializedJobs = [];

    for (const job of jobs) {
      let recommendation = {};

      if (isCandidate && user) {
        const matchedSkills = getMatchedSkills(user.skills, job.skills);
        const requiredSkillScore = skillMatchScore(user.skills, job.skills);
        let aiMatchScore = 0;

        // Skill overlap is preferred when job requirements are explicit.
        if (userEmbedding.length > 0) {
          const jobEmbedding = await ensureJobEmbedding(job);
          aiMatchScore = matchScoreFromSimilarity(
            cosineSimilarity(userEmbedding, jobEmbedding)
          );
        }

        const matchScore =
          Array.isArray(job.skills) && job.skills.length > 0
            ? requiredSkillScore
            : aiMatchScore;

        recommendation = {
          isRecommended: matchScore >= 50,
          matchScore,
          matchedSkills
        };
      }

      serializedJobs.push(serializeJob(job, recommendation));
    }

    serializedJobs.sort((a, b) => {
      if (a.isRecommended !== b.isRecommended) {
        return a.isRecommended ? -1 : 1;
      }
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });

    res.json({
      jobs: serializedJobs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (String(job.postedBy) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this job" });
    }

    await Job.deleteOne({ _id: jobId });

    return res.json({ message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
