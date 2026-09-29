import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { primaryButtonClass } from '../../components/formStyles';
import { subjectLabel } from '../../constants/contributors';
import {
  CANCEL_CONFIRMATION,
  canCancelJob,
  canEditJob,
  difficultyLabel,
  formatDeadline,
  jobStatusLabel,
} from '../../constants/jobs';
import { cancelJob, listJobs } from '../../services/jobService';
import type { Job } from '../../types';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listJobs()
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

  async function handleCancel(job: Job) {
    if (!window.confirm(CANCEL_CONFIRMATION)) {
      return;
    }

    setError('');
    setCancellingId(job.id);

    try {
      const data = await cancelJob(job.id);
      setJobs((current) => current.map((item) => (item.id === data.job.id ? data.job : item)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to cancel job');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Assign one contributor and one template. The template decides the fields they must submit."
        action={
          <Link to="/admin/jobs/new" className={primaryButtonClass}>
            Create Job
          </Link>
        }
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading jobs...</LoadingState>
        ) : jobs.length === 0 ? (
          <EmptyState title="No jobs yet">Create a job when you are ready to assign work.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Contributor</th>
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
                    <td className="px-4 py-3 text-slate-700">
                      {job.contributor?.name ?? 'Unassigned'}
                    </td>
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
                      <div className="flex gap-3 whitespace-nowrap">
                        <Link to={`/admin/jobs/${job.id}`} className="text-slate-900 underline">
                          View
                        </Link>
                        {canEditJob(job.status) ? (
                          <Link
                            to={`/admin/jobs/${job.id}/edit`}
                            className="text-slate-900 underline"
                          >
                            Edit
                          </Link>
                        ) : null}
                        {canCancelJob(job.status) ? (
                          <button
                            type="button"
                            disabled={cancellingId === job.id}
                            onClick={() => handleCancel(job)}
                            className="text-red-700 underline disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        ) : null}
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
