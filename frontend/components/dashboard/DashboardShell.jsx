"use client";

import DashboardNavbar from "./DashboardNavbar";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardShell({
  currentUserName,
  onLogout,
  sidebarTitle,
  sidebarItems = [],
  activeSidebarItem,
  onSidebarItemClick,
  children
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f3f8ff_45%,#eef6ff_100%)] text-slate-900">
      <DashboardNavbar currentUserName={currentUserName} onLogout={onLogout} />
      <main className="min-h-[calc(100vh-73px)]">
        <div
          className={`grid min-h-[calc(100vh-73px)] ${
            sidebarItems.length > 0 ? "lg:grid-cols-[260px_minmax(0,1fr)]" : ""
          }`}
        >
          {sidebarItems.length > 0 && (
            <DashboardSidebar
              title={sidebarTitle}
              items={sidebarItems}
              activeItem={activeSidebarItem}
              onItemClick={onSidebarItemClick}
            />
          )}
          <section className="min-w-0 p-4 sm:p-6 lg:p-10">{children}</section>
        </div>
      </main>
    </div>
  );
}
