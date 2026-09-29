import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobForm } from '../../components/JobForm';
import type { JobFormValues } from '../../components/JobForm';
import { createJob } from '../../services/jobService';
import { buildJobInput } from '../../utils/jobInput';

const emptyValues: JobFormValues = {
  title: '',
  description: '',
  requirements: '',
  subject: '',
  topic: '',
  quantity: '',
  difficulty: '',
  deadline: '',
  instructions: '',
  contributor: '',
  status: 'DRAFT',
  template: '',
};

export function AddJobPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: JobFormValues) {
    const input = buildJobInput(values);
    if (typeof input === 'string') {
      setError(input);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await createJob(input);
      navigate(`/admin/jobs/${data.job.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create job');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Create Job</h2>
      <JobForm
        mode="create"
        initialValues={emptyValues}
        submitting={submitting}
        error={error}
        cancelTo="/admin/jobs"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
