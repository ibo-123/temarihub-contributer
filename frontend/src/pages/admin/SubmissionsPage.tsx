import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { Alert, EmptyState, LoadingState, PageHeader } from "../../components/ui";
import { submissionStatusLabel } from "../../constants/templates";
import { listSubmissions } from "../../services/submissionService";
import type { Submission } from "../../types";

function formatTimestamp(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    date,
  );
}

function initialsFrom(name: string | undefined) {
  if (!name) {
    return "?";
  }
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listSubmissions()
      .then((data) => {
        if (!cancelled) {
          setSubmissions(data.submissions);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load submissions");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative">
      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-rose-200/40 via-amber-200/40 to-emerald-200/40 blur-3xl"
      />

      <PageHeader
        title="Submissions"
        description="Open a submission to start a review, request a revision, approve it, or reject it."
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
        {loading ? (
          <LoadingState>Loading submissions…</LoadingState>
        ) : submissions.length === 0 ? (
          <EmptyState title="No submissions yet">
            They appear here after a contributor starts a job.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Job</th>
                  <th className="px-5 py-3.5 font-medium">Contributor</th>
                  <th className="px-5 py-3.5 font-medium">Template</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="group border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/submissions/${submission.id}`}
                        className="font-medium text-slate-900 transition-colors group-hover:text-slate-950 hover:text-slate-700"
                      >
                        {submission.job.title ?? "Job"}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-violet-100 text-[11px] font-semibold text-slate-700 ring-1 ring-white/60"
                        >
                          {initialsFrom(submission.contributor?.name)}
                        </span>
                        <span className="truncate text-slate-700">
                          {submission.contributor?.name ?? "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {submission.template.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={submissionStatusLabel(submission.status)} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {formatTimestamp(submission.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
