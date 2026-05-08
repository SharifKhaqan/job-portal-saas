"use client";

import { useEffect, useRef, useState } from "react";
import { createApplication } from "../../services/application/applicationService";

const STATUS_LABEL = {
  applied: "Applied",
  shortlisted: "Shortlisted",
  rejected: "Rejected"
};
const JOBS_PER_PAGE = 6;

function formatApplicationDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

function formatJobDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "—";
  }
}

function isJobExpired(lastDateToApply) {
  if (!lastDateToApply) return false;
  const expiryDate = new Date(lastDateToApply);
  if (Number.isNaN(expiryDate.getTime())) return false;
  // Treat the last apply date as valid until end of that day.
  expiryDate.setHours(23, 59, 59, 999);
  return Date.now() > expiryDate.getTime();
}

function profileCompletionPercent(profile) {
  const checks = [
    (profile.name || "").trim().length > 0,
    (profile.email || "").trim().length > 0,
    (profile.skills || "").trim().length > 0,
    (profile.bio || "").trim().length > 0,
    (profile.resumeName || "").trim().length > 0
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export default function CandidateDashboardContent({
  activeSidebarItem,
  currentUserName,
  currentUserEmail,
  candidateProfile,
  onProfileFieldChange,
  onResumeChange,
  onProfileAction,
  isProfileDirty,
  profileActionLoading,
  profileNotice,
  profileNoticeType,
  jobs,
  jobsLoading,
  jobsError,
  applications = [],
  applicationsLoading = false,
  applicationsError = "",
  applicationsCount = 0,
  onApplicationsRefresh,
  onJobsRefresh
}) {
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [jobApplyMessage, setJobApplyMessage] = useState("");
  const [jobApplyMessageType, setJobApplyMessageType] = useState("success");
  const [jobsPage, setJobsPage] = useState(1);
  const jobApplyNoticeTimerRef = useRef(null);

  const clearJobApplyNoticeTimer = () => {
    if (jobApplyNoticeTimerRef.current) {
      clearTimeout(jobApplyNoticeTimerRef.current);
      jobApplyNoticeTimerRef.current = null;
    }
  };

  const scheduleJobApplyNoticeClear = () => {
    clearJobApplyNoticeTimer();
    jobApplyNoticeTimerRef.current = setTimeout(() => {
      jobApplyNoticeTimerRef.current = null;
      setJobApplyMessage("");
    }, 5000);
  };

  useEffect(
    () => () => {
      clearJobApplyNoticeTimer();
    },
    []
  );

  const handleApplyToJob = async (jobId) => {
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      setJobApplyMessage("Please sign in again to apply.");
      setJobApplyMessageType("error");
      scheduleJobApplyNoticeClear();
      return;
    }

    setApplyingJobId(jobId);
    clearJobApplyNoticeTimer();
    setJobApplyMessage("");

    try {
      await createApplication(token, { jobId });
      setJobApplyMessage("Application submitted.");
      setJobApplyMessageType("success");
      scheduleJobApplyNoticeClear();
      if (typeof onApplicationsRefresh === "function") {
        await onApplicationsRefresh();
      }
      if (typeof onJobsRefresh === "function") {
        await onJobsRefresh();
      }
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not submit application.";
      setJobApplyMessage(message);
      setJobApplyMessageType("error");
      scheduleJobApplyNoticeClear();
    } finally {
      setApplyingJobId(null);
    }
  };

  const sortedJobs = [...(Array.isArray(jobs) ? jobs : [])].sort((a, b) => {
    if (Boolean(a.isRecommended) !== Boolean(b.isRecommended)) {
      return a.isRecommended ? -1 : 1;
    }
    if ((Number(b.matchScore) || 0) !== (Number(a.matchScore) || 0)) {
      return (Number(b.matchScore) || 0) - (Number(a.matchScore) || 0);
    }
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });
  const totalJobPages = Math.max(1, Math.ceil(sortedJobs.length / JOBS_PER_PAGE));
  const paginatedJobs = sortedJobs.slice(
    (jobsPage - 1) * JOBS_PER_PAGE,
    jobsPage * JOBS_PER_PAGE
  );
  const showJobsPagination = sortedJobs.length > JOBS_PER_PAGE;
  const isProfileFormComplete = [
    candidateProfile.name,
    candidateProfile.email || currentUserEmail,
    candidateProfile.skills,
    candidateProfile.bio
  ].every((value) => (value || "").trim().length > 0);

  useEffect(() => {
    setJobsPage((page) => Math.min(page, totalJobPages));
  }, [totalJobPages]);

  if (activeSidebarItem === "Profile") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Profile
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Candidate profile
          </h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                value={candidateProfile.name}
                onChange={(e) => onProfileFieldChange("name", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your full name"
              />

              <div className="mt-5 space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="tel"
                  value={candidateProfile.phone || ""}
                  onChange={(e) => onProfileFieldChange("phone", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={candidateProfile.email || currentUserEmail}
                onChange={(e) => onProfileFieldChange("email", e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your email"
              />

              <div className="mt-5 space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  value={candidateProfile.address || ""}
                  onChange={(e) => onProfileFieldChange("address", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  placeholder="Enter your address"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-slate-700">Skills</label>
            <input
              type="text"
              value={candidateProfile.skills}
              onChange={(e) => onProfileFieldChange("skills", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="React, Node.js, UI Design, Communication"
            />
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <textarea
              value={candidateProfile.bio}
              onChange={(e) => onProfileFieldChange("bio", e.target.value)}
              rows="5"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              placeholder="Write a short professional summary about yourself"
            />
          </div>

          <div className="mt-5 space-y-3">
            <label className="text-sm font-medium text-slate-700">Resume</label>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    {candidateProfile.resumeName || "No resume uploaded yet"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload your latest resume in PDF or DOC format.
                  </p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400">
                  {candidateProfile.resumeName ? "Update Resume" : "Upload Resume"}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={onResumeChange}
                  />
                </label>
              </div>
            </div>
          </div>

          {isProfileDirty && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={profileActionLoading || !isProfileFormComplete}
                onClick={() => onProfileAction("save")}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-60"
              >
                {profileActionLoading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                disabled={profileActionLoading || !isProfileFormComplete}
                onClick={() => onProfileAction("update")}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:pointer-events-none disabled:opacity-60"
              >
                {profileActionLoading ? "Updating..." : "Update"}
              </button>
            </div>
          )}

          {profileNotice && (
            <p
              className={`mt-4 text-sm font-medium ${
                profileNoticeType === "error"
                  ? "text-rose-700"
                  : "text-emerald-700"
              }`}
            >
              {profileNotice}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (activeSidebarItem === "Jobs") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Jobs
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Recommended for you
          </h1>
        </div>

        {jobsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">
              Loading available jobs...
            </p>
          </div>
        ) : jobsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">{jobsError}</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-base font-semibold text-slate-900">
              Currently no job available
            </p>
            <p className="mt-2 text-sm text-slate-600">
              New opportunities will appear here once employers post jobs.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {jobApplyMessage && (
              <p
                className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
                  jobApplyMessageType === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800"
                }`}
              >
                {jobApplyMessage}
              </p>
            )}
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedJobs.map((job) => {
              const jobExpired = isJobExpired(job.lastDateToApply);
              const showRecommendedBadge =
                Boolean(job.isRecommended) || (Number(job.matchScore) || 0) >= 50;
              return (
                <article
                  key={job.id}
                  className="flex h-full flex-col rounded-3xl border border-slate-200 bg-white/92 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]"
                >
                <div className="flex min-h-6 flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                    Open role
                  </p>
                  {showRecommendedBadge && (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-300">
                      Recommended
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">
                  {job.title}
                </h2>
                {showRecommendedBadge && (
                  <p className="mt-2 text-sm font-semibold text-emerald-700">
                    {Number(job.matchScore) || 0}% match
                  </p>
                )}
                <div className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">Company:</span>{" "}
                    {job.companyName || job.postedBy?.name || "Unknown company"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">
                      Company location:
                    </span>{" "}
                    {job.companyLocation || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">Job Model:</span>{" "}
                    {job.location || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">Date posted:</span>{" "}
                    {formatJobDate(job.postedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">
                      Last date to apply:
                    </span>{" "}
                    {formatJobDate(job.lastDateToApply)}
                  </p>
                  <div>
                    <span className="font-medium text-slate-800">Skills:</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(job.skills || []).map((skill) => {
                        return (
                        <span
                          key={skill}
                          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200"
                        >
                          {skill}
                        </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={jobExpired || applyingJobId === job.id}
                  onClick={() => handleApplyToJob(job.id)}
                  className={`mt-6 inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    jobExpired
                      ? "bg-rose-500"
                      : "bg-emerald-500 hover:bg-emerald-400"
                  }`}
                >
                  {jobExpired
                    ? "Expired"
                    : applyingJobId === job.id
                      ? "Applying…"
                      : "Apply"}
                </button>
                </article>
              );
            })}
            </div>
            {showJobsPagination && (
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  disabled={jobsPage === 1}
                  onClick={() => setJobsPage((page) => Math.max(1, page - 1))}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={jobsPage === totalJobPages}
                  onClick={() =>
                    setJobsPage((page) => Math.min(totalJobPages, page + 1))
                  }
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  if (activeSidebarItem === "My Applications") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            My Applications
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Track your applications
          </h1>
        </div>

        {applicationsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">
              Loading your applications...
            </p>
          </div>
        ) : applicationsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">
              {applicationsError}
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-base font-semibold text-slate-900">
              No applications yet
            </p>
            <p className="mt-2 text-sm text-slate-600">
              When you apply to jobs, they will appear here with live status
              updates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/92 shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <div className="hidden grid-cols-[minmax(0,2fr)_140px_160px] gap-4 border-b border-slate-200 bg-slate-50/80 px-6 py-4 text-sm font-semibold text-slate-600 md:grid md:min-w-[620px]">
              <p>Job Title</p>
              <p>Status</p>
              <p>Date</p>
            </div>

            <div className="divide-y divide-slate-200">
              {applications.map((application) => {
                const label =
                  STATUS_LABEL[application.status] || application.status;
                return (
                  <div
                    key={application.id}
                    className="grid gap-3 px-6 py-5 md:min-w-[620px] md:grid-cols-[minmax(0,2fr)_140px_160px] md:items-center md:gap-4"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                        Job Title
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {application.job?.title || "Job unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          application.status === "applied"
                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                            : application.status === "shortlisted"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        {label}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 md:hidden">
                        Date
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatApplicationDate(application.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
          Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Welcome back, {currentUserName || "Candidate"}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">
            Total Jobs Available
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {jobsLoading ? "..." : jobs.length}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">
            Applications Submitted
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {applicationsLoading ? "..." : applicationsCount}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">Profile Status</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {profileCompletionPercent(candidateProfile)}%
          </p>
        </article>
      </div>
    </div>
  );
}
