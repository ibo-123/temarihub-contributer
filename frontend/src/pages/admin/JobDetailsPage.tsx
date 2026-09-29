import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityHistory } from '../../components/ActivityHistory';
import { JobDetails, JobField } from '../../components/JobDetails';
import { CANCEL_CONFIRMATION, canCancelJob, canEditJob } from '../../constants/jobs';
import { cancelJob, getJob } from '../../services/jobService';
import type { Job } from '../../types';

function BackToJobs({ message }: { message: string }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <p className="text-red-600">{message}</p>
      <Link to="/admin/jobs" className="mt-4 inline-block text-sm text-slate-900 underline">
        Back to jobs
      </Link>
    </section>
  );
}

export function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getJob(id)
      .then((data) => {
        if (!cancelled) {
          setJob(data.job);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load job');
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
  }, [id]);

  async function handleCancel() {
    if (!job || !window.confirm(CANCEL_CONFIRMATION)) {
      return;
    }

    setActionError('');
    setCancelling(true);

    try {
      const data = await cancelJob(job.id);
      setJob(data.job);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Unable to cancel job');
    } finally {
      setCancelling(false);
    }
  }

  if (!id) {
    return <BackToJobs message="Invalid job ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading job...</p>;
  }

  if (error || !job) {
    return <BackToJobs message={error || 'Job not found'} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link to="/admin/jobs" className="text-sm text-slate-600 underline">
            Jobs
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Job Details</h2>
        </div>
        <div className="flex gap-3">
          {canEditJob(job.status) ? (
            <Link
              to={`/admin/jobs/${job.id}/edit`}
              className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Edit
            </Link>
          ) : null}
          {canCancelJob(job.status) ? (
            <button
              type="button"
              disabled={cancelling}
              onClick={handleCancel}
              className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Job'}
            </button>
          ) : null}
        </div>
      </div>

      {actionError ? <p className="mb-4 text-sm text-red-600">{actionError}</p> : null}

      <JobDetails
        job={job}
        showCreated
        extra={
          <>
            <JobField label="Contributor">
              {job.contributor ? (
                <Link to={`/admin/contributors/${job.contributor.id}`} className="underline">
                  {job.contributor.name}
                </Link>
              ) : (
                'Unassigned'
              )}
            </JobField>
            <JobField label="Created By">{job.createdBy?.name ?? 'Unknown'}</JobField>
          </>
        }
      />
      <ActivityHistory entityType="Job" entityId={job.id} />
    </div>
  );
}
