import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { JobForm } from '../../components/JobForm';
import type { JobFormValues } from '../../components/JobForm';
import { canEditJob, toDateInputValue } from '../../constants/jobs';
import { getJob, updateJob } from '../../services/jobService';
import type { Job } from '../../types';
import { buildJobInput } from '../../utils/jobInput';

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

export function EditJobPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

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
          setLoadError(err instanceof Error ? err.message : 'Unable to load job');
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

  async function handleSubmit(values: JobFormValues) {
    if (!id) {
      return;
    }

    const input = buildJobInput(values);
    if (typeof input === 'string') {
      setError(input);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await updateJob(id, input);
      navigate(`/admin/jobs/${data.job.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update job');
    } finally {
      setSubmitting(false);
    }
  }

  if (!id) {
    return <BackToJobs message="Invalid job ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading job...</p>;
  }

  if (loadError || !job) {
    return <BackToJobs message={loadError || 'Job not found'} />;
  }

  if (!canEditJob(job.status)) {
    return <BackToJobs message={`${job.status === 'CANCELLED' ? 'Cancelled' : 'Completed'} jobs cannot be edited`} />;
  }

  const initialValues: JobFormValues = {
    title: job.title,
    description: job.description,
    requirements: job.requirements,
    subject: job.subject,
    topic: job.topic,
    quantity: String(job.quantity),
    difficulty: job.difficulty,
    deadline: toDateInputValue(job.deadline),
    instructions: job.instructions,
    contributor: job.contributor?.id ?? '',
    status: job.status,
    template: job.template?.id ?? '',
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Edit Job</h2>
      <JobForm
        mode="edit"
        initialValues={initialValues}
        currentStatus={job.status}
        submitting={submitting}
        error={error}
        cancelTo={`/admin/jobs/${id}`}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
