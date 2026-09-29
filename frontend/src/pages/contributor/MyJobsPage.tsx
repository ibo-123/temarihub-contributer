import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "../../components/StatusBadge";
import { Alert, EmptyState, LoadingState, PageHeader } from "../../components/ui";
import { subjectLabel } from "../../constants/contributors";
import { difficultyLabel, formatDeadline, jobStatusLabel } from "../../constants/jobs";
import { listMyJobs } from "../../services/jobService";
import type { ContributorJob } from "../../types";

export function MyJobsPage() {
  const [jobs, setJobs] = useState<ContributorJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listMyJobs()
      .then((data) => {
        if (!cancelled) {
          setJobs(data.jobs);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load jobs");
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
        title="My jobs"
        description="Open a job to see its template, then start or continue the submission."
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm">
        {loading ? (
          <LoadingState>Loading jobs…</LoadingState>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs yet">
            When an admin assigns you work, it will show up here.
          </EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/60 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 font-medium">Job</th>
                  <th className="px-5 py-3.5 font-medium">Subject</th>
                  <th className="px-5 py-3.5 font-medium">Topic</th>
                  <th className="px-5 py-3.5 font-medium">Qty</th>
                  <th className="px-5 py-3.5 font-medium">Difficulty</th>
                  <th className="px-5 py-3.5 font-medium">Deadline</th>
                  <th className="px-5 py-3.5 font-medium">Status</th>
                  <th className="px-5 py-3.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="group border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/contributor/jobs/${job.id}`}
                        className="font-medium text-slate-900 transition-colors group-hover:text-slate-950 hover:text-slate-700"
                      >
                        {job.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {subjectLabel(job.subject)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      <span className="line-clamp-1 max-w-[16rem]">{job.topic}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {job.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={difficultyLabel(job.difficulty)} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                      {formatDeadline(job.deadline)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge label={jobStatusLabel(job.status)} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end whitespace-nowrap">
                        <Link
                          to={`/contributor/jobs/${job.id}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 hover:shadow-sm"
                        >
                          View
                        </Link>
                      </div>
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
