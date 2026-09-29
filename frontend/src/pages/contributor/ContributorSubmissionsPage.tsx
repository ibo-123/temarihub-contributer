import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { Alert, EmptyState, LoadingState, PageHeader } from "../../components/ui";
import { submissionStatusLabel } from "../../constants/templates";
import { listMySubmissions } from "../../services/submissionService";
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

export function ContributorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listMySubmissions()
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
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200/40 via-violet-200/40 to-amber-200/40 blur-3xl"
      />

      <PageHeader
        title="Submissions"
        description="Drafts stay editable. Submitted work shows the status and the date it was sent."
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
        {loading ? (
          <LoadingState>Loading submissions…</LoadingState>
        ) : submissions.length === 0 ? (
          <EmptyState title="No submissions yet">
            Open a job and start a submission when you are ready.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Job</th>
                  <th className="px-5 py-3.5 font-medium">Template</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 font-medium">Updated</th>
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
                        to={`/contributor/jobs/${submission.job.id}/submission`}
                        className="font-medium text-slate-900 transition-colors group-hover:text-slate-950 hover:text-slate-700"
                      >
                        {submission.job.title ?? "Job"}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {submission.template.name}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={submissionStatusLabel(submission.status)} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatTimestamp(submission.updatedAt)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
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
