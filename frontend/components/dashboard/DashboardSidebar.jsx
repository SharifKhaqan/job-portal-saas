"use client";

export default function DashboardSidebar({
  title,
  items,
  activeItem,
  onItemClick
}) {
  if (!items.length) {
    return null;
  }

  return (
    <aside className="border-b border-slate-200/90 bg-white/92 p-3 shadow-[0_20px_60px_rgba(148,163,184,0.14)] lg:border-b-0 lg:border-r lg:p-4">
      <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
        {title}
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:space-y-1 lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onItemClick(item)}
            className={`flex shrink-0 cursor-pointer items-center rounded-2xl px-4 py-3 text-left text-sm font-medium transition lg:w-full lg:shrink lg:py-3.5 ${
              activeItem === item
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}
