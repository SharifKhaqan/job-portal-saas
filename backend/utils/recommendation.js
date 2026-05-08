const crypto = require("crypto");

const FALLBACK_MODEL = "local-hashed-bow-v1";
const DEFAULT_OPENAI_MODEL = "text-embedding-3-small";
const LOCAL_DIMENSIONS = 256;

function selectedEmbeddingModel() {
  return process.env.OPENAI_API_KEY
    ? process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_OPENAI_MODEL
    : FALLBACK_MODEL;
}

function hasReusableEmbedding(doc, source) {
  return (
    source &&
    doc.recommendationEmbeddingSource === source &&
    [selectedEmbeddingModel(), FALLBACK_MODEL].includes(
      doc.recommendationEmbeddingModel
    ) &&
    Array.isArray(doc.recommendationEmbedding) &&
    doc.recommendationEmbedding.length > 0
  );
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function buildUserRecommendationText(user) {
  const skills = Array.isArray(user?.skills) ? user.skills.join(", ") : "";
  return normalizeText(
    [
      skills && `Skills: ${skills}`,
      user?.bio && `Professional summary: ${user.bio}`,
      user?.resumeText && `Resume: ${user.resumeText}`
    ]
      .filter(Boolean)
      .join("\n")
  );
}

function buildJobRecommendationText(job) {
  const skills = Array.isArray(job?.skills) ? job.skills.join(", ") : "";
  return normalizeText(
    [
      job?.title && `Job title: ${job.title}`,
      job?.description && `Description: ${job.description}`,
      skills && `Required skills: ${skills}`
    ]
      .filter(Boolean)
      .join("\n")
  );
}

function sourceHash(text) {
  return crypto.createHash("sha256").update(text).digest("hex");
}

function localEmbedding(text) {
  // Deterministic fallback keeps recommendations working without an OpenAI key.
  const vector = Array.from({ length: LOCAL_DIMENSIONS }, () => 0);
  const tokens = normalizeText(text)
    .toLowerCase()
    .match(/[a-z0-9+#.]+/g);

  if (!tokens) return vector;

  for (const token of tokens) {
    const hash = crypto.createHash("sha256").update(token).digest();
    const index = hash.readUInt32BE(0) % LOCAL_DIMENSIONS;
    const sign = hash[4] % 2 === 0 ? 1 : -1;
    vector[index] += sign;
  }

  return normalizeVector(vector);
}

function normalizeVector(vector) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!magnitude) return vector;
  return vector.map((value) => value / magnitude);
}

async function createEmbedding(text) {
  const input = normalizeText(text);
  if (!input) {
    return { embedding: [], model: "", source: "" };
  }

  const source = sourceHash(input);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      embedding: localEmbedding(input),
      model: FALLBACK_MODEL,
      source
    };
  }

  const model = process.env.OPENAI_EMBEDDING_MODEL || DEFAULT_OPENAI_MODEL;
  try {
    // Prefer OpenAI embeddings when configured; fall back locally on API errors.
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model, input })
    });

    if (!response.ok) {
      throw new Error(`Embedding request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      embedding: data?.data?.[0]?.embedding || [],
      model,
      source
    };
  } catch {
    return {
      embedding: localEmbedding(input),
      model: FALLBACK_MODEL,
      source
    };
  }
}

async function ensureUserEmbedding(user) {
  const text = buildUserRecommendationText(user);
  const source = text ? sourceHash(text) : "";

  // Reuse stored vectors until the profile/resume text changes.
  if (hasReusableEmbedding(user, source)) {
    return user.recommendationEmbedding;
  }

  const result = await createEmbedding(text);
  user.recommendationEmbedding = result.embedding;
  user.recommendationEmbeddingSource = result.source;
  user.recommendationEmbeddingModel = result.model;
  user.recommendationEmbeddingUpdatedAt = result.embedding.length ? new Date() : undefined;
  await user.save();
  return user.recommendationEmbedding;
}

async function ensureJobEmbedding(job) {
  const text = buildJobRecommendationText(job);
  const source = text ? sourceHash(text) : "";

  // Job vectors are cached for faster repeated candidate matching.
  if (hasReusableEmbedding(job, source)) {
    return job.recommendationEmbedding;
  }

  const result = await createEmbedding(text);
  job.recommendationEmbedding = result.embedding;
  job.recommendationEmbeddingSource = result.source;
  job.recommendationEmbeddingModel = result.model;
  job.recommendationEmbeddingUpdatedAt = result.embedding.length ? new Date() : undefined;
  await job.save();
  return job.recommendationEmbedding;
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) {
    return 0;
  }

  const length = Math.min(a.length, b.length);
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < length; i += 1) {
    const x = Number(a[i]) || 0;
    const y = Number(b[i]) || 0;
    dot += x * y;
    magnitudeA += x * x;
    magnitudeB += y * y;
  }

  if (!magnitudeA || !magnitudeB) return 0;
  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

function matchScoreFromSimilarity(similarity) {
  return Math.round(Math.max(0, Math.min(1, similarity)) * 100);
}

function normalizeSkill(skill) {
  return String(skill || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, "");
}

function skillAliases(skill) {
  const normalized = normalizeSkill(skill);
  if (!normalized) return [];

  const aliases = new Set([normalized]);
  const javascriptTools = new Set([
    "react",
    "node",
    "express",
    "next",
    "nest",
    "vue"
  ]);

  if (normalized.endsWith("js")) {
    aliases.add(normalized.slice(0, -2));
  }

  if (javascriptTools.has(normalized)) {
    aliases.add(`${normalized}js`);
  }

  return [...aliases];
}

function skillsOverlap(userSkill, jobSkill) {
  const userAliases = new Set(skillAliases(userSkill));
  return skillAliases(jobSkill).some((alias) => userAliases.has(alias));
}

function getMatchedSkills(userSkills = [], jobSkills = []) {
  return jobSkills.filter((jobSkill) =>
    userSkills.some((userSkill) => skillsOverlap(userSkill, jobSkill))
  );
}

function skillMatchScore(userSkills = [], jobSkills = []) {
  const requiredSkills = [
    ...new Set(jobSkills.map(normalizeSkill).filter(Boolean))
  ];
  if (requiredSkills.length === 0) return 0;

  const matchedCount = requiredSkills.filter((jobSkill) =>
    userSkills.some((userSkill) => skillsOverlap(userSkill, jobSkill))
  ).length;

  return Math.round((matchedCount / requiredSkills.length) * 100);
}

module.exports = {
  buildJobRecommendationText,
  buildUserRecommendationText,
  cosineSimilarity,
  ensureJobEmbedding,
  ensureUserEmbedding,
  getMatchedSkills,
  matchScoreFromSimilarity,
  skillMatchScore
};
