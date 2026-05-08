"use client";

import Link from "next/link";

export default function DashboardNavbar({
  currentUserName,
  onLogout
}) {
  return (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <Link
            href="/"
            className="block truncate text-base font-semibold tracking-tight text-slate-900 transition hover:text-slate-700 sm:text-lg"
          >
            Job Portal SaaS
          </Link>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Signed in as
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {currentUserName || "User"}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
