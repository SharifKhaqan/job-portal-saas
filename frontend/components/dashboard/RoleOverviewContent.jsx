"use client";

export default function RoleOverviewContent({
  role,
  badgeClass,
  title,
  description,
  highlights,
  accentClass
}) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <section className="rounded-3xl border border-slate-200 bg-white/92 p-7 shadow-[0_20px_60px_rgba(148,163,184,0.18)] sm:p-8">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${badgeClass}`}
        >
          {role} portal
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(148,163,184,0.2)]"
          >
            <div className={`h-1 w-16 rounded-full ${accentClass}`} />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
