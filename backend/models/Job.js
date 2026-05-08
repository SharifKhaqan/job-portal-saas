const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    skills: {
      type: [String],
      default: []
    },
    companyName: {
      type: String,
      default: ""
    },
    companyLocation: {
      type: String,
      default: ""
    },
    lastDateToApply: {
      type: Date,
      required: true
    },
    postedAt: {
      type: Date,
      default: Date.now
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    recommendationEmbedding: {
      type: [Number],
      default: []
    },
    recommendationEmbeddingSource: {
      type: String,
      default: ""
    },
    recommendationEmbeddingModel: {
      type: String,
      default: ""
    },
    recommendationEmbeddingUpdatedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
