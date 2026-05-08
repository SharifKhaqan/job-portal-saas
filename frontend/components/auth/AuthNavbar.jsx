import Link from "next/link";

export default function AuthNavbar() {
  return (
    <header className="w-full shrink-0 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="rounded-lg text-base font-semibold tracking-tight text-white outline-none transition hover:text-sky-100 focus-visible:ring-2 focus-visible:ring-sky-500 sm:text-lg"
        >
          Job Portal SaaS
        </Link>
      </div>
    </header>
  );
}
