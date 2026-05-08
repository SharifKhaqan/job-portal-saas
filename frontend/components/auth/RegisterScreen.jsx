"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import AuthNavbar from "./AuthNavbar";
import Toast from "../Toast";
import { registerUser } from "../../services/auth/authService";

function EyeIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const roleDropdownRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    if (!roleMenuOpen) {
      return;
    }

    const handlePointerDown = (e) => {
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(e.target)
      ) {
        setRoleMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [roleMenuOpen]);

  const roleLabel = form.role === "employer" ? "Employer" : "Candidate";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await registerUser(form);
      setToast({
        type: "success",
        message: "Account created. You can sign in now."
      });
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Could not create your account. Please try again.";
      setToast({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={dismissToast}
        />
      )}

      <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800">
        <AuthNavbar />
        <main className="flex flex-1 items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
          <section className="w-full max-w-md rounded-2xl bg-slate-900/80 p-5 shadow-2xl ring-1 ring-slate-700/70 backdrop-blur sm:p-6">
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-white sm:text-2xl">
                Create your account
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                Join Job Portal SaaS and start your hiring journey.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">
                  Full name
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">
                  Email
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-slate-200">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-3 pr-11 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center rounded-r-lg bg-slate-900/40 px-3 text-slate-100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5 shrink-0" />
                    ) : (
                      <EyeIcon className="h-5 w-5 shrink-0" />
                    )}
                  </button>
                </div>
              </div>
              <div className="relative space-y-1" ref={roleDropdownRef}>
                <label
                  id="role-label"
                  className="block text-sm font-medium text-slate-200"
                >
                  I&apos;m signing up as
                </label>
                <button
                  type="button"
                  id="role-trigger"
                  aria-labelledby="role-label"
                  aria-haspopup="listbox"
                  aria-expanded={roleMenuOpen}
                  onClick={() => setRoleMenuOpen((o) => !o)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-left text-sm text-slate-100 outline-none transition hover:border-emerald-500/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40"
                >
                  <span>{roleLabel}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${roleMenuOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {roleMenuOpen && (
                  <ul
                    role="listbox"
                    aria-labelledby="role-label"
                    className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-slate-600 bg-slate-900 py-1 shadow-xl ring-1 ring-black/50"
                  >
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={form.role === "candidate"}
                        className="flex w-full cursor-pointer items-center px-3 py-2.5 text-left text-sm text-slate-100 transition hover:bg-emerald-500/30 hover:text-white focus:bg-emerald-500/30 focus:text-white focus:outline-none"
                        onClick={() => {
                          setForm({ ...form, role: "candidate" });
                          setRoleMenuOpen(false);
                        }}
                      >
                        Candidate
                      </button>
                    </li>
                    <li role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={form.role === "employer"}
                        className="flex w-full cursor-pointer items-center px-3 py-2.5 text-left text-sm text-slate-100 transition hover:bg-emerald-500/30 hover:text-white focus:bg-emerald-500/30 focus:text-white focus:outline-none"
                        onClick={() => {
                          setForm({ ...form, role: "employer" });
                          setRoleMenuOpen(false);
                        }}
                      >
                        Employer
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-60"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-300">
              Already have an account?{" "}
              <Link href="/" className="font-medium text-sky-400 hover:text-sky-300">
                Go to login
              </Link>
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
