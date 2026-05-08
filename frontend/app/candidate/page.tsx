import RoleDashboard from "../../components/dashboard/RoleDashboard";

const highlights = [
  {
    title: "Profile progress",
    description:
      "Update your profile, skills, bio, and resume so employers see accurate information when you apply."
  },
  {
    title: "Applications",
    description:
      "View every application you have submitted, with status and dates synced from the server."
  },
  {
    title: "Job discovery",
    description:
      "Browse live job posts from employers, including role details, location, and required skills."
  }
];

export default function CandidatePage() {
  return (
    <RoleDashboard
      role="candidate"
      accentClass="bg-emerald-500"
      badgeClass="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      sidebarItems={["Dashboard", "Profile", "Jobs", "My Applications"]}
      title="Candidate Dashboard"
      description="You are signed in as a candidate. Use the menu to manage your profile, browse open roles, and track applications backed by live data."
      highlights={highlights}
    />
  );
}
