"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import Toast from "../Toast";
import { loginUser } from "../../services/auth/authService";

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

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const dismissToast = useCallback(() => setToast(null), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await loginUser(form);
      const { token, user } = res.data;
      const routesByRole = {
        admin: "/admin",
        employer: "/employer",
        candidate: "/candidate"
      };
      const redirectPath = routesByRole[user?.role];

      if (!token || !user || !redirectPath) {
        throw new Error("Unexpected login response");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToast({
        type: "success",
        message: "Signed in successfully. Welcome back!"
      });
      router.push(redirectPath);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Invalid email or password. Please try again.";
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

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-200">
            Email
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2 pl-3 pr-11 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="........"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center justify-center rounded-r-lg bg-slate-900/40 px-3 text-slate-100 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/80"
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
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </>
  );
}
