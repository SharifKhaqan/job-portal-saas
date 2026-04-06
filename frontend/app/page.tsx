"use client";

import Link from "next/link";
import AuthNavbar from "../components/AuthNavbar";
import Login from "../pages/login";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800">
      <AuthNavbar />
      <main className="flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <div className="flex w-full max-w-5xl flex-col items-center gap-10 md:flex-row md:items-stretch">
        {/* Left: marketing / hero */}
        <section className="flex-1 text-center md:text-left">
          <p className="mb-3 inline-flex rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-sky-500/40">
            Smart hiring made simple
          </p>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Find your next hire
            <br />
            or your next job.
          </h1>
          <p className="max-w-md text-sm text-slate-300 sm:text-base">
            Manage candidates, post jobs, and streamline hiring in one modern
            platform tailored for both employers and job seekers.
          </p>
        </section>

        {/* Right: login card */}
        <section className="w-full max-w-md rounded-2xl bg-slate-900/80 p-6 shadow-2xl ring-1 ring-slate-700/70 backdrop-blur">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white sm:text-2xl">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Sign in to access your dashboard, manage applications, and more.
            </p>
          </div>

          <Login />

          <p className="mt-6 text-center text-sm text-slate-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-sky-400 hover:text-sky-300"
            >
              Create one now
            </Link>
          </p>
        </section>
        </div>
      </main>
    </div>
  );
}
