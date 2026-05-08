import RoleDashboard from "../../components/dashboard/RoleDashboard";

const highlights = [
  {
    title: "Manage job posts",
    description:
      "Publish roles from Post Job and review them under My Jobs, synced with the same job feed candidates see."
  },
  {
    title: "Review applicants",
    description:
      "The Applications area is ready to list candidates once your employer applications API is wired in."
  },
  {
    title: "Team workflow",
    description:
      "The shell matches the candidate workspace so future hiring tools can drop in with a consistent layout."
  }
];

export default function EmployerPage() {
  return (
    <RoleDashboard
      role="employer"
      accentClass="bg-amber-500"
      badgeClass="bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      sidebarItems={["Dashboard", "Post Job", "My Jobs", "Applications"]}
      title="Employer Dashboard"
      description="You are signed in as an employer. Use the menu to manage listings and review hiring activity."
      highlights={highlights}
    />
  );
}
