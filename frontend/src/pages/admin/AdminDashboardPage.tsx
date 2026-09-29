import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const actions = [
  {
    to: "/admin/contributors",
    title: "Contributors",
    text: "Create accounts, assign a subject, and activate or deactivate people.",
    accent: "from-sky-100 to-sky-50",
    ring: "group-hover:ring-sky-200",
    icon: "👥",
  },
  {
    to: "/admin/templates",
    title: "Templates",
    text: "Define the fields contributors must fill when they submit work.",
    accent: "from-violet-100 to-violet-50",
    ring: "group-hover:ring-violet-200",
    icon: "🧩",
  },
  {
    to: "/admin/jobs",
    title: "Jobs",
    text: "Assign work, choose a template, and set the quantity and deadline.",
    accent: "from-amber-100 to-amber-50",
    ring: "group-hover:ring-amber-200",
    icon: "📋",
  },
  {
    to: "/admin/submissions",
    title: "Submissions",
    text: "Review submitted work, request a revision, approve it, or reject it.",
    accent: "from-rose-100 to-rose-50",
    ring: "group-hover:ring-rose-200",
    icon: "📝",
  },
  {
    to: "/admin/content",
    title: "Content ready",
    text: "Export the approved version for handoff to the main platform.",
    accent: "from-emerald-100 to-emerald-50",
    ring: "group-hover:ring-emerald-200",
    icon: "✅",
  },
  {
    to: "/admin/activity",
    title: "Activity",
    text: "See who assigned work, submitted it, requested a revision, or approved it.",
    accent: "from-indigo-100 to-indigo-50",
    ring: "group-hover:ring-indigo-200",
    icon: "📊",
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="relative">
      {/* Soft background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200/40 via-violet-200/40 to-rose-200/40 blur-3xl"
      />

      {/* Header */}
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm sm:p-8">
        <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium tracking-wide text-slate-600">
          Admin
        </span>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Welcome back, {user?.name}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Review submitted work, then mark the approved version content ready so it can be exported.
        </p>
      </div>

      {/* Actions grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ring-1 ring-transparent transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            {/* Subtle gradient wash on hover */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${action.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />

            <div className="relative flex items-start gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent} text-lg shadow-inner ring-1 ring-white/60 transition-transform duration-300 group-hover:scale-105`}
                aria-hidden="true"
              >
                {action.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-slate-900">{action.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-500 transition-colors group-hover:text-slate-600">
                  {action.text}
                </p>
              </div>
            </div>

            {/* Arrow hint */}
            <span
              aria-hidden="true"
              className="absolute right-5 top-5 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-slate-500 group-hover:opacity-100"
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
