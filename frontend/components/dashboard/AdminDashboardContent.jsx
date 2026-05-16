"use client";

import { useState } from "react";

function formatDate(iso) {
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

export default function AdminDashboardContent({
  activeSidebarItem,
  currentUserName,
  stats,
  statsLoading,
  statsError,
  users = [],
  usersLoading = false,
  usersError = "",
  jobs = [],
  jobsLoading = false,
  jobsError = "",
  applications = [],
  applicationsLoading = false,
  applicationsError = "",
  actionLoadingId = "",
  onBlockUser,
  onDeleteUser,
  onDeleteJob,
  onDeleteApplication
}) {
  const [userPendingDelete, setUserPendingDelete] = useState(null);
  const [jobPendingDelete, setJobPendingDelete] = useState(null);
  const [applicationPendingDelete, setApplicationPendingDelete] =
    useState(null);
  const [applicationCandidatePendingBlock, setApplicationCandidatePendingBlock] =
    useState(null);

  if (activeSidebarItem === "Users") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Users
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Manage users
          </h1>
        </div>

        {usersLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">Loading users...</p>
          </div>
        ) : usersError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">{usersError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
            <div className="hidden gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid lg:min-w-[920px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_140px_120px_210px]">
              <p>Name</p>
              <p>Email</p>
              <p>Role</p>
              <p>Status</p>
              <p>Actions</p>
            </div>
            <div className="divide-y divide-slate-200">
              {users.map((user) => {
                const isBusy = actionLoadingId === user.id;
                return (
                  <div
                    key={user.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 lg:min-w-[920px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_140px_120px_210px] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Name
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {user.name || "Unknown"}
                      </p>
                    </div>
                    <div className="min-w-0 break-all">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Email
                      </p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Role
                      </p>
                      <p className="text-sm font-medium capitalize text-slate-700">
                        {user.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          user.isBlocked
                            ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onBlockUser(user.id)}
                        className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-semibold text-white transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 ${
                          user.isBlocked
                            ? "bg-emerald-500 hover:bg-emerald-400"
                            : "bg-amber-500 hover:bg-amber-400"
                        }`}
                      >
                        {user.isBlocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setUserPendingDelete(user)}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {userPendingDelete ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 ring-1 ring-rose-200">
                Confirm delete
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Delete this user?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {userPendingDelete.name || "This user"} will be removed from the
                platform. This action cannot be undone.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserPendingDelete(null)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteUser(userPendingDelete.id);
                    setUserPendingDelete(null);
                  }}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  Delete user
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
            Manage jobs
          </h1>
        </div>

        {jobsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">Loading jobs...</p>
          </div>
        ) : jobsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">{jobsError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
            <div className="hidden gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid lg:min-w-[760px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_140px]">
              <p>Job Title</p>
              <p>Employer</p>
              <p>Location</p>
              <p>Actions</p>
            </div>
            <div className="divide-y divide-slate-200">
              {jobs.map((job) => {
                const isBusy = actionLoadingId === job.id;
                return (
                  <div
                    key={job.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 lg:min-w-[760px] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_140px] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Job Title
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {job.title}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Employer
                      </p>
                      <p className="text-sm text-slate-600">
                        {job.employer?.name || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Location
                      </p>
                      <p className="text-sm text-slate-600">
                        {job.location || "-"}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setJobPendingDelete(job)}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete Job
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {jobPendingDelete ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 ring-1 ring-rose-200">
                Confirm delete
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Delete this job?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {jobPendingDelete.title || "This job"} will be removed from the
                platform. This action cannot be undone.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setJobPendingDelete(null)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteJob(jobPendingDelete.id);
                    setJobPendingDelete(null);
                  }}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  Delete job
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (activeSidebarItem === "Applications") {
    const getResumeUrl = (resumePath) => {
      if (!resumePath) return "";
      if (/^https?:\/\//i.test(resumePath)) return resumePath;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL 
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api$/, '') 
        : "http://localhost:5000";
      return `${baseUrl}${resumePath.startsWith("/") ? "" : "/"}${resumePath}`;
    };

    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Applications
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Manage applications
          </h1>
        </div>

        {applicationsLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white/92 p-8 text-center shadow-[0_20px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm font-medium text-slate-600">
              Loading applications...
            </p>
          </div>
        ) : applicationsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">
              {applicationsError}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white/95 shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
            <div className="hidden gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:grid lg:min-w-[900px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_120px_250px]">
              <p>Candidate</p>
              <p>Job</p>
              <p>Resume</p>
              <p>Status</p>
              <p>Actions</p>
            </div>
            <div className="divide-y divide-slate-200">
              {applications.map((application) => {
                const resumeUrl = getResumeUrl(application.candidate?.resume);
                const isBusy = actionLoadingId === application.id;
                return (
                  <div
                    key={application.id}
                    className="grid gap-4 px-5 py-5 transition hover:bg-slate-50/70 lg:min-w-[900px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_120px_250px] lg:items-center"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Candidate
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {application.candidate?.name || "Unknown"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(application.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Job
                      </p>
                      <p className="text-sm text-slate-600">
                        {application.job?.title || "Unknown"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Resume
                      </p>
                      {resumeUrl ? (
                        <a
                          href={resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-semibold text-emerald-700 underline-offset-2 hover:underline"
                        >
                          View resume
                        </a>
                      ) : (
                        <p className="text-sm text-slate-500">No resume</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 lg:hidden">
                        Status
                      </p>
                      <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 ring-1 ring-sky-200">
                        {application.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => setApplicationPendingDelete(application)}
                        className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-rose-500 px-3 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={isBusy || !application.candidate?.id}
                        onClick={() =>
                          setApplicationCandidatePendingBlock(application)
                        }
                        className={`inline-flex h-9 cursor-pointer items-center justify-center rounded-lg px-3 text-xs font-semibold text-white transition disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 ${
                          application.candidate?.isBlocked
                            ? "bg-emerald-500 hover:bg-emerald-400"
                            : "bg-amber-500 hover:bg-amber-400"
                        }`}
                      >
                        {application.candidate?.isBlocked
                          ? "Unblock User"
                          : "Block User"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {applicationPendingDelete ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-rose-700 ring-1 ring-rose-200">
                Confirm delete
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                Delete this application?
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The application from{" "}
                {applicationPendingDelete.candidate?.name || "this candidate"}{" "}
                for {applicationPendingDelete.job?.title || "this job"} will be
                removed. This action cannot be undone.
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplicationPendingDelete(null)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteApplication(applicationPendingDelete.id);
                    setApplicationPendingDelete(null);
                  }}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  Delete application
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {applicationCandidatePendingBlock ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
              <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 ring-1 ring-amber-200">
                Confirm action
              </span>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">
                {applicationCandidatePendingBlock.candidate?.isBlocked
                  ? "Unblock this user?"
                  : "Block this user?"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {applicationCandidatePendingBlock.candidate?.name ||
                  "This candidate"}{" "}
                will be{" "}
                {applicationCandidatePendingBlock.candidate?.isBlocked
                  ? "restored to active access"
                  : "blocked from using the platform"}
                .
              </p>
              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setApplicationCandidatePendingBlock(null)}
                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBlockUser(
                      applicationCandidatePendingBlock.candidate.id
                    );
                    setApplicationCandidatePendingBlock(null);
                  }}
                  className={`inline-flex h-10 cursor-pointer items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition ${
                    applicationCandidatePendingBlock.candidate?.isBlocked
                      ? "bg-emerald-500 hover:bg-emerald-400"
                      : "bg-amber-500 hover:bg-amber-400"
                  }`}
                >
                  {applicationCandidatePendingBlock.candidate?.isBlocked
                    ? "Unblock user"
                    : "Block user"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  if (activeSidebarItem === "Analytics") {
    const analyticsCards = [
      { label: "Users", value: stats.totalUsers },
      { label: "Jobs", value: stats.totalJobs },
      { label: "Applications", value: stats.totalApplications }
    ];
    const roleCards = [
      { label: "Candidates", value: stats.totalCandidates },
      { label: "Employers", value: stats.totalEmployers }
    ];
    const maxValue = Math.max(
      ...analyticsCards.map((card) => Number(card.value) || 0),
      1
    );

    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            Analytics
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Platform analytics
          </h1>
        </div>

        {statsError ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
            <p className="text-sm font-medium text-rose-700">{statsError}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-3">
              {analyticsCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                    {statsLoading ? "..." : card.value}
                  </p>
                </article>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_70px_rgba(148,163,184,0.18)]">
              <div className="space-y-5">
                {analyticsCards.map((card) => (
                  <div key={card.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {card.label}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {statsLoading ? "..." : card.value}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{
                          width: `${Math.max(
                            6,
                            ((Number(card.value) || 0) / maxValue) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {roleCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {card.label}
                  </p>
                  <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                    {statsLoading ? "..." : card.value}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (activeSidebarItem !== "Dashboard") {
    return (
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
            {activeSidebarItem}
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {activeSidebarItem}
          </h1>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Total Users",
      value: stats.totalUsers
    },
    {
      label: "Total Jobs",
      value: stats.totalJobs
    },
    {
      label: "Total Applications",
      value: stats.totalApplications
    }
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 ring-1 ring-emerald-200">
          Dashboard
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Welcome back, {currentUserName || "Admin"}
        </h1>
      </div>

      {statsError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 text-center shadow-[0_20px_60px_rgba(248,113,113,0.08)]">
          <p className="text-sm font-medium text-rose-700">{statsError}</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)]"
            >
              <p className="text-sm font-medium text-slate-500">
                {card.label}
              </p>
              <p className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
                {statsLoading ? "..." : card.value}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
