import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { subjectLabel } from '../../constants/contributors';
import { difficultyLabel, formatDeadline, jobStatusLabel } from '../../constants/jobs';
import { listMyJobs } from '../../services/jobService';
import type { ContributorJob } from '../../types';

export function MyJobsPage() {
  const [jobs, setJobs] = useState<ContributorJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setError(err instanceof Error ? err.message : 'Unable to load jobs');
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
    <div>
      <PageHeader
        title="My Jobs"
        description="Open a job to see its template, then start or continue the submission."
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading jobs...</LoadingState>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs yet">When an admin assigns you work, it will show up here.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Difficulty</th>
                  <th className="px-4 py-3 font-medium">Deadline</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{job.title}</td>
                    <td className="px-4 py-3 text-slate-700">{subjectLabel(job.subject)}</td>
                    <td className="px-4 py-3 text-slate-700">{job.topic}</td>
                    <td className="px-4 py-3 text-slate-700">{job.quantity}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={difficultyLabel(job.difficulty)} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                      {formatDeadline(job.deadline)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={jobStatusLabel(job.status)} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/contributor/jobs/${job.id}`}
                        className="text-slate-900 underline"
                      >
                        View
                      </Link>
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
