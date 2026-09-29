import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { JobDetails } from '../../components/JobDetails';
import { Alert, PageHeader } from '../../components/ui';
import { primaryButtonClass } from '../../components/formStyles';
import { deadlineHasPassed, formatDeadline, jobStatusLabel } from '../../constants/jobs';
import { submissionStatusLabel } from '../../constants/templates';
import { getMyJob } from '../../services/jobService';
import { getMySubmission } from '../../services/submissionService';
import type { ContributorJob, Submission } from '../../types';

function BackToJobs({ message }: { message: string }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <p className="text-red-600">{message}</p>
      <Link to="/contributor/jobs" className="mt-4 inline-block text-sm text-slate-900 underline">
        Back to my jobs
      </Link>
    </section>
  );
}

export function ContributorJobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState<ContributorJob | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getMyJob(id)
      .then(async (data) => {
        const submissionData = await getMySubmission(id);
        if (!cancelled) {
          setJob(data.job);
          setSubmission(submissionData.submission);
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

  if (!id) {
    return <BackToJobs message="Invalid job ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading job...</p>;
  }

  if (error || !job) {
    return <BackToJobs message={error || 'Job not found'} />;
  }

  const canStart =
    Boolean(job.template) &&
    !submission &&
    (job.status === 'ASSIGNED' || job.status === 'IN_PROGRESS');
  const submissionLabel = !job.template
    ? null
    : !submission
      ? canStart
        ? 'Start Submission'
        : null
      : submission.status === 'DRAFT'
        ? 'Continue Submission'
        : submission.status === 'REVISION_REQUIRED'
          ? 'Revise Submission'
          : 'View Submission';

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to="/contributor/jobs" className="hover:text-slate-900">
            My Jobs
          </Link>
        }
        title={job.title}
        description={
          job.template
            ? `${job.template.name} · ${job.quantity} items · due ${formatDeadline(job.deadline)}`
            : `Due ${formatDeadline(job.deadline)}`
        }
        action={
          submissionLabel ? (
            <Link to={`/contributor/jobs/${job.id}/submission`} className={primaryButtonClass}>
              {submissionLabel}
            </Link>
          ) : null
        }
      />
      {!job.template ? (
        <Alert tone="warning">This job does not have a submission template yet.</Alert>
      ) : null}
      {job.template && deadlineHasPassed(job.deadline) && (!submission || submission.status === 'DRAFT') ? (
        <Alert tone="warning">
          The deadline has passed. A draft can still be opened, but it can no longer be submitted.
        </Alert>
      ) : null}
      {submission ? (
        <p className="mb-4 text-sm text-slate-600">
          Submission status: {submissionStatusLabel(submission.status)}. Job status: {jobStatusLabel(job.status)}.
        </p>
      ) : null}
      <JobDetails job={job} />
    </div>
  );
}
