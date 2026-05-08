const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    default: function defaultCandidatePhone() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  address: {
    type: String,
    default: function defaultCandidateAddress() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["candidate", "employer", "admin"],
    default: "candidate"
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  resume: {
    type: String,
    default: function defaultCandidateResume() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  resumeText: {
    type: String,
    default: function defaultCandidateResumeText() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  skills: {
    type: [String],
    default: function defaultCandidateSkills() {
      return this.role === "candidate" ? [] : undefined;
    }
  },
  bio: {
    type: String,
    default: function defaultCandidateBio() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  recommendationEmbedding: {
    type: [Number],
    default: function defaultCandidateRecommendationEmbedding() {
      return this.role === "candidate" ? [] : undefined;
    }
  },
  recommendationEmbeddingSource: {
    type: String,
    default: function defaultCandidateRecommendationEmbeddingSource() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  recommendationEmbeddingModel: {
    type: String,
    default: function defaultCandidateRecommendationEmbeddingModel() {
      return this.role === "candidate" ? "" : undefined;
    }
  },
  recommendationEmbeddingUpdatedAt: {
    type: Date
  }
}, { timestamps: true });

userSchema.pre("save", function stripCandidateOnlyFields() {
  if (this.role !== "candidate") {
    this.phone = undefined;
    this.address = undefined;
    this.resume = undefined;
    this.resumeText = undefined;
    this.skills = undefined;
    this.bio = undefined;
    this.recommendationEmbedding = undefined;
    this.recommendationEmbeddingSource = undefined;
    this.recommendationEmbeddingModel = undefined;
    this.recommendationEmbeddingUpdatedAt = undefined;
  }
});

module.exports = mongoose.model("User", userSchema);
