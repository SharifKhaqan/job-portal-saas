"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Toast({ type, message, onDismiss }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const id = setTimeout(onDismiss, 5000);
    return () => clearTimeout(id);
  }, [onDismiss]);

  const isSuccess = type === "success";

  const node = (
    <div
      role="alert"
      className={`pointer-events-auto fixed left-4 right-4 top-4 z-[200] mx-auto flex w-auto max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition sm:left-auto sm:right-4 sm:mx-0 ${
        isSuccess
          ? "border-emerald-500/40 bg-emerald-950/95 text-emerald-50"
          : "border-red-500/40 bg-red-950/95 text-red-50"
      }`}
    >
      <span
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
          isSuccess ? "bg-emerald-500/25 text-emerald-200" : "bg-red-500/25 text-red-200"
        }`}
        aria-hidden
      >
        {isSuccess ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          {isSuccess ? "Success" : "Something went wrong"}
        </p>
        <p className="mt-1 text-sm leading-snug">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-md p-1 text-current opacity-70 transition hover:bg-white/10 hover:opacity-100 cursor-pointer"
        aria-label="Dismiss notification"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-4 w-4"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(node, document.body);
}
