"use client";

import { useState, useEffect, useRef } from "react";
import { createJob, deleteJob } from "../../services/job/jobService";
import { updateApplicationStatus } from "../../services/application/applicationService";

const STATUS_LABEL = {
  applied: "Pending review",
  shortlisted: "Accepted",
  rejected: "Rejected"
};

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
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "-";
  }
}

function formatDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTomorrowInputValue() {
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateInputValue(tomorrow);
}

function isFutureDateInputValue(value) {
  if (!value) return false;

  const [year, month, day] = value.split("-").map(Number);
  const selectedDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate.getTime() > today.getTime();
}

export default function EmployerDashboardContent({
  activeSidebarItem,
  currentUserName,
  employerId,
  jobs,
  jobsLoading,
  jobsError,
  onJobsRefresh,
  employerApplications = [],
  employerApplicationsLoading = false,
  employerApplicationsError = "",
  employerApplicationsCount = 0,
  onEmployerApplicationsRefresh
}) {
  const [postForm, setPostForm] = useState({
    title: "",
    description: "",
    location: "",
    skills: "",
    companyName: "",
    companyLocation: "",
    lastDateToApply: ""
  });
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postNotice, setPostNotice] = useState("");
  const [postNoticeType, setPostNoticeType] = useState("success");
  const [updatingApplicationId, setUpdatingApplicationId] = useState("");
  const postNoticeClearRef = useRef(null);

  function clearPostNoticeTimeout() {
    if (postNoticeClearRef.current != null) {
      clearTimeout(postNoticeClearRef.current);
      postNoticeClearRef.current = null;
    }
  }

  function schedulePostNoticeClear() {
    clearPostNoticeTimeout();
    postNoticeClearRef.current = setTimeout(() => {
      postNoticeClearRef.current = null;
      setPostNotice("");
    }, 5000);
  }

  useEffect(() => {
    return () => clearPostNoticeTimeout();
  }, []);

  const myJobs =
    employerId && Array.isArray(jobs)
      ? jobs.filter(
          (j) => String(j.postedBy?.id || "") === String(employerId)
        )
      : [];
  const isPostFormComplete = [
    postForm.title,
    postForm.description,
    postForm.location,
    postForm.skills,
    postForm.companyName,
    postForm.companyLocation,
    postForm.lastDateToApply
  ].every((value) => (value || "").trim().length > 0);
  const isPostDateValid = isFutureDateInputValue(postForm.lastDateToApply);
  const canPublishJob = isPostFormComplete && isPostDateValid;

  const handlePublishJob = async () => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      setPostNotice("Please sign in again to post a job.");
      setPostNoticeType("error");
      return;
    }

    if (!isFutureDateInputValue(postForm.lastDateToApply)) {
      clearPostNoticeTimeout();
      setPostNotice("Please select a valid date.");
      setPostNoticeType("error");
      return;
    }

    setPostSubmitting(true);
    clearPostNoticeTimeout();
    setPostNotice("");

    try {
      await createJob(token, {
        title: postForm.title,
        description: postForm.description,
        location: postForm.location,
        skills: postForm.skills,
        companyName: postForm.companyName,
        companyLocation: postForm.companyLocation,
        lastDateToApply: postForm.lastDateToApply
      });
      setPostForm({
        title: "",
        description: "",
        location: "",
        skills: "",
        companyName: "",
        companyLocation: "",
        lastDateToApply: ""
      });
      setPostNotice("Job published successfully.");
      setPostNoticeType("success");
      schedulePostNoticeClear();
      if (typeof onJobsRefresh === "function") {
        await onJobsRefresh();
      }
      if (typeof onEmployerApplicationsRefresh === "function") {
        await onEmployerApplicationsRefresh();
      }
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not publish this job.";
      setPostNotice(message);
      setPostNoticeType("error");
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) {
      return;
    }

    const confirmed =
      typeof window !== "undefined" &&
      window.confirm("Delete this job? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteJob(token, jobId);
      if (typeof onJobsRefresh === "function") {
        await onJobsRefresh();
      }
    } catch {
      // keep UI unchanged on failure; user can retry
    }
  };

  const getResumeDownloadUrl = (resumePath) => {
    if (!resumePath) return "";
    if (/^https?:\/\//i.test(resumePath)) return resumePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
      : "http://localhost:5000";
    return `${baseUrl}${resumePath.startsWith("/") ? "" : "/"}${resumePath}`;
  };

  const handleApplicationStatusUpdate = async (applicationId, status) => {
    const token = typeof window !== "undefined" && localStorage.getItem("token");
    if (!token) return;

    setUpdatingApplicationId(applicationId);
    try {
      await updateApplicationStatus(token, applicationId, status);
      if (typeof onEmployerApplicationsRefresh === "function") {
        await onEmployerApplicationsRefresh();
      }
    } catch {
      // no-op: keep existing UI state
    } finally {
      setUpdatingApplicationId("");
    }
  };

  if (activeSidebarItem === "Post Job") {
    return (
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Post Job
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Create a job listing
          </h1>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Job title</label>
              <input
                type="text"
                value={postForm.title}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, title: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">
                Description
              </label>
              <textarea
                value={postForm.description}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Role responsibilities, requirements, and benefits"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Company name
              </label>
              <input
                type="text"
                value={postForm.companyName}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, companyName: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Acme Inc."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Company location
              </label>
              <input
                type="text"
                value={postForm.companyLocation}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, companyLocation: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="e.g. Lahore, PK (HQ)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Work Model
              </label>
              <input
                type="text"
                value={postForm.location}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, location: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Remote, On-site, or Hybrid"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Skills</label>
              <input
                type="text"
                value={postForm.skills}
                onChange={(e) =>
                  setPostForm((p) => ({ ...p, skills: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                placeholder="Comma-separated, e.g. React, Node.js"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Last date to apply
              </label>
              <input
                type="date"
                value={postForm.lastDateToApply}
                min={getTomorrowInputValue()}
                required
                onChange={(e) => {
                  if (e.target.value && !isFutureDateInputValue(e.target.value)) {
                    clearPostNoticeTimeout();
                    setPostNotice("Please select a valid date.");
                    setPostNoticeType("error");
                  } else if (postNoticeType === "error") {
                    setPostNotice("");
                  }

                  setPostForm((p) => ({
                    ...p,
                    lastDateToApply: e.target.value
                  }));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
          {postNotice && (
            <p
              className={`mt-4 text-sm font-medium ${
                postNoticeType === "error"
                  ? "text-rose-700"
                  : "text-emerald-700"
              }`}
            >
              {postNotice}
            </p>
          )}

          <div className="mt-6">
            <button
              type="button"
              disabled={postSubmitting || !canPublishJob}
              onClick={handlePublishJob}
              className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {postSubmitting ? "Publishing…" : "Publish job"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeSidebarItem === "My Jobs") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            My Jobs
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Your published roles
          </h1>
        </div>

        {jobsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">Loading jobs…</p>
          </div>
        ) : jobsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">{jobsError}</p>
          </div>
        ) : myJobs.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-base font-semibold text-slate-900">
              No jobs posted yet
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {myJobs.map((job) => (
              <article
                key={job.id}
                className="relative rounded-3xl border border-slate-200 bg-white/92 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteJob(job.id)}
                  className="absolute right-4 top-4 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Delete job"
                  title="Delete job"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4h8v2" />
                    <path d="M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </button>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  Your listing
                </p>
                <h2 className="mt-3 text-xl font-semibold text-slate-900">
                  {job.title}
                </h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-800">
                      Company Name:
                    </span>{" "}
                    {job.companyName || "-"}
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
                    <span className="font-medium text-slate-800">
                      Last date to apply:
                    </span>{" "}
                    {formatJobDate(job.lastDateToApply)}
                  </p>
                  <div>
                    <span className="font-medium text-slate-800">Skills:</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(job.skills || []).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeSidebarItem === "Applications") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Applications
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Review applicants
          </h1>
        </div>

        {employerApplicationsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">
              Loading applications…
            </p>
          </div>
        ) : employerApplicationsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">
              {employerApplicationsError}
            </p>
          </div>
        ) : employerApplications.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-base font-semibold text-slate-900">
              No applications yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
            <div className="hidden min-w-[1120px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid lg:grid-cols-[minmax(160px,1.2fr)_minmax(130px,0.9fr)_minmax(190px,1.1fr)_minmax(130px,0.8fr)_120px_130px_230px]">
              <p>Job</p>
              <p>Candidate</p>
              <p>Email</p>
              <p>Phone</p>
              <p>Status</p>
              <p>Applied</p>
              <p>Actions</p>
            </div>
            <div className="divide-y divide-slate-200">
              {employerApplications.map((row) => {
                const label = STATUS_LABEL[row.status] || row.status;
                const isUpdating = updatingApplicationId === row.id;
                const resumeUrl = getResumeDownloadUrl(row.candidate?.resume);
                return (
                  <div
                    key={row.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 lg:min-w-[1120px] lg:grid-cols-[minmax(160px,1.2fr)_minmax(130px,0.9fr)_minmax(190px,1.1fr)_minmax(130px,0.8fr)_120px_130px_230px] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Job
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {row.job?.title || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Candidate
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {row.candidate?.name || "—"}
                      </p>
                    </div>
                    <div className="min-w-0 break-all">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Email
                      </p>
                      <p className="text-sm text-slate-600 underline-offset-2">
                        {row.candidate?.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Phone
                      </p>
                      <p className="text-sm text-slate-600">
                        {row.candidate?.phone || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          row.status === "applied"
                            ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200"
                            : row.status === "shortlisted"
                              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                              : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Applied
                      </p>
                      <p className="text-sm text-slate-600">
                        {formatApplicationDate(row.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Actions
                      </p>
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
                        >
                          Download resume
                        </a>
                      ) : null}
                    </div>
                    <div className="flex justify-end gap-2 lg:col-span-7">
                      <button
                        type="button"
                        disabled={isUpdating || row.status === "shortlisted"}
                        onClick={() =>
                          handleApplicationStatusUpdate(row.id, "shortlisted")
                        }
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-emerald-500 px-3 text-xs font-semibold text-white transition hover:bg-emerald-400 disabled:pointer-events-none disabled:opacity-60"
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating || row.status === "rejected"}
                        onClick={() =>
                          handleApplicationStatusUpdate(row.id, "rejected")
                        }
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:pointer-events-none disabled:opacity-60"
                      >
                        Reject
                      </button>
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
          Welcome back, {currentUserName || "Employer"}
        </h1>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">Jobs on platform</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {jobsLoading ? "..." : jobs.length}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">Your job posts</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {jobsLoading ? "..." : myJobs.length}
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
          <p className="text-sm font-medium text-slate-500">Applications</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            {employerApplicationsLoading ? "..." : employerApplicationsCount}
          </p>
        </article>
      </div>
    </div>
  );
}
