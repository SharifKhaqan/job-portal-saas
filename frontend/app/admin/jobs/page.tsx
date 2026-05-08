import RoleDashboard from "../../../components/dashboard/RoleDashboard";

export default function AdminJobsPage() {
  return (
    <RoleDashboard
      role="admin"
      accentClass="bg-rose-500"
      badgeClass="bg-rose-50 text-rose-700 ring-1 ring-rose-200"
      title="Admin Dashboard"
      description="You are signed in as an admin."
      highlights={[]}
      sidebarItems={["Dashboard", "Users", "Jobs", "Applications", "Analytics"]}
      initialSidebarItem="Jobs"
    />
  );
}
