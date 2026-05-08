"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEmployerApplications,
  getMyApplications
} from "../../services/application/applicationService";
import {
  blockAdminUser,
  deleteAdminApplication,
  deleteAdminJob,
  deleteAdminUser,
  getAdminApplications,
  getAdminJobs,
  getAdminStats,
  getAdminUsers
} from "../../services/admin/adminService";
import { getAllJobs } from "../../services/job/jobService";
import { updateUserProfile } from "../../services/user/userService";
import AdminDashboardContent from "./AdminDashboardContent";
import CandidateDashboardContent from "./CandidateDashboardContent";
import EmployerDashboardContent from "./EmployerDashboardContent";
import DashboardShell from "./DashboardShell";
import RoleOverviewContent from "./RoleOverviewContent";

function createProfileSnapshot(profile) {
  // Snapshot only persisted values so we can detect unsaved profile edits.
  return {
    name: (profile.name || "").trim(),
    email: (profile.email || "").trim(),
    phone: (profile.phone || "").trim(),
    address: (profile.address || "").trim(),
    skills: (profile.skills || "").trim(),
    bio: (profile.bio || "").trim(),
    resumeName: profile.resumeFile ? profile.resumeFile.name : profile.resumeName || ""
  };
}

function profilesMatch(a, b) {
  return (
    a.name === b.name &&
    a.email === b.email &&
    a.phone === b.phone &&
    a.address === b.address &&
    a.skills === b.skills &&
    a.bio === b.bio &&
    a.resumeName === b.resumeName
  );
}

/**
 * @param {{
 *   role: string;
 *   accentClass: string;
 *   badgeClass: string;
 *   title: string;
 *   description: string;
 *   highlights: Array<{ title: string; description: string }>;
 *   sidebarItems?: string[];
 *   initialSidebarItem?: string;
 * }} props
 */
export default function RoleDashboard({
  role,
  accentClass,
  badgeClass,
  title,
  description,
  highlights,
  sidebarItems = [],
  initialSidebarItem = ""
}) {
  const router = useRouter();
  const [authState, setAuthState] = useState("checking");
  const [redirectPath, setRedirectPath] = useState("/");
  const [currentUserName, setCurrentUserName] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [activeSidebarItem, setActiveSidebarItem] = useState(
    initialSidebarItem || sidebarItems[0] || ""
  );
  const [candidateProfile, setCandidateProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    bio: "",
    resumeName: "",
    resumeFile: null
  });
  const [profileNotice, setProfileNotice] = useState("");
  const [profileNoticeType, setProfileNoticeType] = useState("success");
  const [savedCandidateProfile, setSavedCandidateProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    skills: "",
    bio: "",
    resumeName: ""
  });
  const [profileActionLoading, setProfileActionLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState("");
  const [employerId, setEmployerId] = useState("");
  const [employerApplications, setEmployerApplications] = useState([]);
  const [employerApplicationsLoading, setEmployerApplicationsLoading] =
    useState(false);
  const [employerApplicationsError, setEmployerApplicationsError] =
    useState("");
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalCandidates: 0,
    totalEmployers: 0
  });
  const [adminStatsLoading, setAdminStatsLoading] = useState(false);
  const [adminStatsError, setAdminStatsError] = useState("");
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminJobs, setAdminJobs] = useState([]);
  const [adminJobsLoading, setAdminJobsLoading] = useState(false);
  const [adminJobsError, setAdminJobsError] = useState("");
  const [adminApplications, setAdminApplications] = useState([]);
  const [adminApplicationsLoading, setAdminApplicationsLoading] =
    useState(false);
  const [adminApplicationsError, setAdminApplicationsError] = useState("");
  const [adminActionLoadingId, setAdminActionLoadingId] = useState("");

  useEffect(() => {
    if (!profileNotice || profileNoticeType !== "success") return;

    const timerId = setTimeout(() => {
      setProfileNotice("");
    }, 5000);

    return () => clearTimeout(timerId);
  }, [profileNotice, profileNoticeType]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      setAuthState("unauthorized");
      setRedirectPath("/");
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      const routesByRole = {
        admin: "/admin",
        employer: "/employer",
        candidate: "/candidate"
      };

      if (user?.role === role) {
        // Dashboard pages are role-specific; redirect users to their own area.
        setCurrentUserName(user?.name || "User");
        setCurrentUserEmail(user?.email || "");
        setEmployerId(
          user?.role === "employer" && user?.id ? String(user.id) : ""
        );
        const nextProfile = {
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          address: user?.address || "",
          skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
          bio: user?.bio || "",
          resumeName: user?.resume
            ? user.resume.split("/").pop()
            : "",
          resumeFile: null
        };
        setCandidateProfile(nextProfile);
        setSavedCandidateProfile(createProfileSnapshot(nextProfile));
        setAuthState("authorized");
        return;
      }

      setAuthState("unauthorized");
      setRedirectPath(routesByRole[user?.role] || "/");
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState("unauthorized");
      setRedirectPath("/");
      setCurrentUserName("");
      setCurrentUserEmail("");
      setEmployerId("");
    }
  }, [role]);

  useEffect(() => {
    setActiveSidebarItem(initialSidebarItem || sidebarItems[0] || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- depend on sidebar label sequence, not array identity
  }, [initialSidebarItem, sidebarItems.join("|")]);

  useEffect(() => {
    if (authState === "unauthorized") {
      router.replace(redirectPath);
    }
  }, [authState, redirectPath, router]);

  const refreshJobs = useCallback(async () => {
    if (authState !== "authorized") return;
    if (role !== "candidate" && role !== "employer") return;

    setJobsLoading(true);
    setJobsError("");

    try {
      const token = localStorage.getItem("token");
      const res = await getAllJobs(token);
      setJobs(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load jobs right now.";
      setJobsError(message);
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  const refreshEmployerApplications = useCallback(async () => {
    if (authState !== "authorized" || role !== "employer") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setEmployerApplicationsLoading(true);
    setEmployerApplicationsError("");

    try {
      const res = await getEmployerApplications(token);
      setEmployerApplications(
        Array.isArray(res.data?.applications) ? res.data.applications : []
      );
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load applications.";
      setEmployerApplicationsError(message);
      setEmployerApplications([]);
    } finally {
      setEmployerApplicationsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshEmployerApplications();
  }, [refreshEmployerApplications]);

  const refreshMyApplications = useCallback(async () => {
    if (authState !== "authorized" || role !== "candidate") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setApplicationsLoading(true);
    setApplicationsError("");

    try {
      const res = await getMyApplications(token);
      setApplications(
        Array.isArray(res.data?.applications) ? res.data.applications : []
      );
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load your applications.";
      setApplicationsError(message);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshMyApplications();
  }, [refreshMyApplications]);

  const refreshAdminStats = useCallback(async () => {
    if (authState !== "authorized" || role !== "admin") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminStatsLoading(true);
    setAdminStatsError("");

    try {
      const res = await getAdminStats(token);
      const stats = res.data?.stats || {};
      setAdminStats({
        totalUsers: Number(stats.totalUsers) || 0,
        totalJobs: Number(stats.totalJobs) || 0,
        totalApplications: Number(stats.totalApplications) || 0,
        totalCandidates: Number(stats.totalCandidates) || 0,
        totalEmployers: Number(stats.totalEmployers) || 0
      });
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load admin stats.";
      setAdminStatsError(message);
      setAdminStats({
        totalUsers: 0,
        totalJobs: 0,
        totalApplications: 0,
        totalCandidates: 0,
        totalEmployers: 0
      });
    } finally {
      setAdminStatsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshAdminStats();
  }, [refreshAdminStats]);

  const refreshAdminUsers = useCallback(async () => {
    if (authState !== "authorized" || role !== "admin") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminUsersLoading(true);
    setAdminUsersError("");

    try {
      const res = await getAdminUsers(token);
      setAdminUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load users.";
      setAdminUsersError(message);
      setAdminUsers([]);
    } finally {
      setAdminUsersLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshAdminUsers();
  }, [refreshAdminUsers]);

  const refreshAdminJobs = useCallback(async () => {
    if (authState !== "authorized" || role !== "admin") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminJobsLoading(true);
    setAdminJobsError("");

    try {
      const res = await getAdminJobs(token);
      setAdminJobs(Array.isArray(res.data?.jobs) ? res.data.jobs : []);
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load jobs.";
      setAdminJobsError(message);
      setAdminJobs([]);
    } finally {
      setAdminJobsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshAdminJobs();
  }, [refreshAdminJobs]);

  const refreshAdminApplications = useCallback(async () => {
    if (authState !== "authorized" || role !== "admin") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminApplicationsLoading(true);
    setAdminApplicationsError("");

    try {
      const res = await getAdminApplications(token);
      setAdminApplications(
        Array.isArray(res.data?.applications) ? res.data.applications : []
      );
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not load applications.";
      setAdminApplicationsError(message);
      setAdminApplications([]);
    } finally {
      setAdminApplicationsLoading(false);
    }
  }, [authState, role]);

  useEffect(() => {
    refreshAdminApplications();
  }, [refreshAdminApplications]);

  const handleAdminBlockUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminActionLoadingId(userId);
    try {
      await blockAdminUser(token, userId);
      // Keep all admin panels in sync after a user action.
      await Promise.all([
        refreshAdminUsers(),
        refreshAdminApplications(),
        refreshAdminStats()
      ]);
    } catch {
      // keep current table state; a manual refresh will retry the request
    } finally {
      setAdminActionLoadingId("");
    }
  };

  const handleAdminDeleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminActionLoadingId(userId);
    try {
      await deleteAdminUser(token, userId);
      await Promise.all([refreshAdminUsers(), refreshAdminStats()]);
    } catch {
      // keep current table state; a manual refresh will retry the request
    } finally {
      setAdminActionLoadingId("");
    }
  };

  const handleAdminDeleteJob = async (jobId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminActionLoadingId(jobId);
    try {
      await deleteAdminJob(token, jobId);
      await Promise.all([refreshAdminJobs(), refreshAdminStats()]);
    } catch {
      // keep current table state; a manual refresh will retry the request
    } finally {
      setAdminActionLoadingId("");
    }
  };

  const handleAdminDeleteApplication = async (applicationId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setAdminActionLoadingId(applicationId);
    try {
      await deleteAdminApplication(token, applicationId);
      await Promise.all([refreshAdminApplications(), refreshAdminStats()]);
    } catch {
      // keep current table state; a manual refresh will retry the request
    } finally {
      setAdminActionLoadingId("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const handleSidebarItemClick = (item) => {
    setActiveSidebarItem(item);

    if (role !== "admin") return;

    const adminRoutes = {
      Dashboard: "/admin",
      Users: "/admin/users",
      Jobs: "/admin/jobs",
      Applications: "/admin/applications",
      Analytics: "/admin/analytics"
    };

    if (adminRoutes[item]) {
      router.push(adminRoutes[item]);
    }
  };

  const handleProfileFieldChange = (field, value) => {
    setCandidateProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    setProfileNotice("");
    setProfileNoticeType("success");
  };

  const uploadResumeNow = async (file) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setProfileNotice("Please sign in again to update your resume.");
      setProfileNoticeType("error");
      return;
    }

    try {
      setProfileActionLoading(true);
      setProfileNotice("");

      const formData = new FormData();
      // Resume upload sends the full profile so backend keeps one source of truth.
      formData.append("name", candidateProfile.name);
      formData.append("email", candidateProfile.email);
      formData.append("phone", candidateProfile.phone);
      formData.append("address", candidateProfile.address);
      formData.append("skills", candidateProfile.skills);
      formData.append("bio", candidateProfile.bio);
      formData.append("resume", file);

      const res = await updateUserProfile({ token, formData });
      const updatedUser = res.data.user;

      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          ...updatedUser
        })
      );

      setCurrentUserName(updatedUser.name || "User");
      setCurrentUserEmail(updatedUser.email || "");

      const nextProfile = {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || candidateProfile.phone,
        address: updatedUser.address || candidateProfile.address,
        skills: Array.isArray(updatedUser.skills)
          ? updatedUser.skills.join(", ")
          : "",
        bio: updatedUser.bio || "",
        resumeName: updatedUser.resume
          ? updatedUser.resume.split("/").pop()
          : "",
        resumeFile: null
      };

      setCandidateProfile(nextProfile);
      setSavedCandidateProfile(createProfileSnapshot(nextProfile));

      setProfileNotice("Resume updated successfully.");
      setProfileNoticeType("success");
      await refreshJobs();
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not update your resume right now.";
      setProfileNotice(message);
      setProfileNoticeType("error");
    } finally {
      setProfileActionLoading(false);
    }
  };

  const handleResumeChange = (e) => {
    const file = e.target.files?.[0];
    setCandidateProfile((prev) => ({
      ...prev,
      resumeName: file ? file.name : prev.resumeName,
      resumeFile: file || null
    }));

    // Make sure the selected resume replaces the DB record immediately.
    if (file) {
      uploadResumeNow(file);
    }

    setProfileNotice("");
    setProfileNoticeType("success");
  };

  const handleProfileAction = async (action) => {
    const token = localStorage.getItem("token");

    if (!token) {
      setProfileNotice("Please sign in again to update your profile.");
      setProfileNoticeType("error");
      return;
    }

    try {
      setProfileActionLoading(true);
      const formData = new FormData();
      formData.append("name", candidateProfile.name);
      formData.append("email", candidateProfile.email);
      formData.append("phone", candidateProfile.phone);
      formData.append("address", candidateProfile.address);
      formData.append("skills", candidateProfile.skills);
      formData.append("bio", candidateProfile.bio);

      if (candidateProfile.resumeFile) {
        formData.append("resume", candidateProfile.resumeFile);
      }

      const res = await updateUserProfile({ token, formData });
      const updatedUser = res.data.user;
      const existingUser = JSON.parse(localStorage.getItem("user") || "{}");

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          ...updatedUser
        })
      );

      setCurrentUserName(updatedUser.name || "User");
      setCurrentUserEmail(updatedUser.email || "");
      const nextProfile = {
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || candidateProfile.phone,
        address: updatedUser.address || candidateProfile.address,
        skills: Array.isArray(updatedUser.skills)
          ? updatedUser.skills.join(", ")
          : "",
        bio: updatedUser.bio || "",
        resumeName: updatedUser.resume
          ? updatedUser.resume.split("/").pop()
          : candidateProfile.resumeName,
        resumeFile: null
      };
      setCandidateProfile(nextProfile);
      setSavedCandidateProfile(createProfileSnapshot(nextProfile));
      setProfileNotice(
        action === "update"
          ? "Profile information updated successfully."
          : "Profile details saved successfully."
      );
      setProfileNoticeType("success");
      await refreshJobs();
    } catch (error) {
      const data = error.response?.data;
      const message =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not update your profile right now.";
      setProfileNotice(message);
      setProfileNoticeType("error");
    } finally {
      setProfileActionLoading(false);
    }
  };

  if (authState === "checking") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_42%,#f8fafc_100%)] px-4 text-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_32%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.1),_transparent_28%)]" />
        <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(148,163,184,0.28)] backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-sky-200 bg-sky-50">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-sky-200 border-t-sky-500" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-sky-700">
            Authenticating
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
            Preparing your dashboard
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We are verifying your role and loading the right workspace for you.
          </p>
          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-sky-400 via-cyan-500 to-sky-400" />
          </div>
        </div>
      </div>
    );
  }

  if (authState !== "authorized") {
    return null;
  }

  const isProfileDirty = !profilesMatch(
    createProfileSnapshot(candidateProfile),
    savedCandidateProfile
  );

  let dashboardContent;

  if (role === "candidate" && sidebarItems.length > 0) {
    dashboardContent = (
      <CandidateDashboardContent
        activeSidebarItem={activeSidebarItem}
        currentUserName={currentUserName}
        currentUserEmail={currentUserEmail}
        candidateProfile={candidateProfile}
        onProfileFieldChange={handleProfileFieldChange}
        onResumeChange={handleResumeChange}
        onProfileAction={handleProfileAction}
        isProfileDirty={isProfileDirty}
        profileActionLoading={profileActionLoading}
        profileNotice={profileNotice}
        profileNoticeType={profileNoticeType}
        jobs={jobs}
        jobsLoading={jobsLoading}
        jobsError={jobsError}
        applications={applications}
        applicationsLoading={applicationsLoading}
        applicationsError={applicationsError}
        applicationsCount={applications.length}
        onApplicationsRefresh={refreshMyApplications}
        onJobsRefresh={refreshJobs}
      />
    );
  } else if (role === "employer" && sidebarItems.length > 0) {
    dashboardContent = (
      <EmployerDashboardContent
        activeSidebarItem={activeSidebarItem}
        currentUserName={currentUserName}
        employerId={employerId}
        jobs={jobs}
        jobsLoading={jobsLoading}
        jobsError={jobsError}
        onJobsRefresh={refreshJobs}
        employerApplications={employerApplications}
        employerApplicationsLoading={employerApplicationsLoading}
        employerApplicationsError={employerApplicationsError}
        employerApplicationsCount={employerApplications.length}
        onEmployerApplicationsRefresh={refreshEmployerApplications}
      />
    );
  } else if (role === "admin" && sidebarItems.length > 0) {
    dashboardContent = (
      <AdminDashboardContent
        activeSidebarItem={activeSidebarItem}
        currentUserName={currentUserName}
        stats={adminStats}
        statsLoading={adminStatsLoading}
        statsError={adminStatsError}
        users={adminUsers}
        usersLoading={adminUsersLoading}
        usersError={adminUsersError}
        jobs={adminJobs}
        jobsLoading={adminJobsLoading}
        jobsError={adminJobsError}
        applications={adminApplications}
        applicationsLoading={adminApplicationsLoading}
        applicationsError={adminApplicationsError}
        actionLoadingId={adminActionLoadingId}
        onBlockUser={handleAdminBlockUser}
        onDeleteUser={handleAdminDeleteUser}
        onDeleteJob={handleAdminDeleteJob}
        onDeleteApplication={handleAdminDeleteApplication}
      />
    );
  } else {
    dashboardContent = (
      <RoleOverviewContent
        role={role}
        badgeClass={badgeClass}
        title={title}
        description={description}
        highlights={highlights}
        accentClass={accentClass}
      />
    );
  }

  return (
    <DashboardShell
      currentUserName={currentUserName}
      onLogout={handleLogout}
      sidebarTitle={
        role === "candidate"
          ? "Candidate Menu"
          : role === "employer"
            ? "Employer Menu"
            : role === "admin"
              ? "Admin Menu"
            : `${role} menu`
      }
      sidebarItems={sidebarItems}
      activeSidebarItem={activeSidebarItem}
      onSidebarItemClick={handleSidebarItemClick}
    >
      {dashboardContent}
    </DashboardShell>
  );
}
