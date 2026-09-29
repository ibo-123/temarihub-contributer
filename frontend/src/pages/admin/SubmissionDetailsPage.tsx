import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityHistory } from '../../components/ActivityHistory';
import { ReviewHistory, VersionHistory } from '../../components/ReviewHistory';
import { StatusBadge } from '../../components/StatusBadge';
import { SubmissionContent } from '../../components/SubmissionContent';
import { Alert, PageHeader } from '../../components/ui';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../../components/formStyles';
import type { ReviewDecision } from '../../constants/templates';
import { submissionStatusLabel } from '../../constants/templates';
import {
  downloadSubmissionExport,
  downloadSubmissionFile,
  getSubmission,
  markContentReady,
  reviewSubmission,
  startReview,
} from '../../services/submissionService';
import type { Submission, SubmissionFile } from '../../types';

function BackToSubmissions({ message }: { message: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-red-600">{message}</p>
      <Link to="/admin/submissions" className="mt-4 inline-block text-sm text-slate-900 underline">
        Back to submissions
      </Link>
    </section>
  );
}

export function SubmissionDetailsPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getSubmission(id)
      .then((data) => {
        if (!cancelled) {
          setSubmission(data.submission);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load submission');
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

  async function run(action: string, task: () => Promise<Submission>, message: string) {
    setError('');
    setNotice('');
    setBusy(action);

    try {
      setSubmission(await task());
      setNotice(message);
      if (action !== 'APPROVED') {
        setFeedback('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update the review');
    } finally {
      setBusy('');
    }
  }

  async function handleDownload(file: SubmissionFile) {
    if (!submission) {
      return;
    }

    setDownloadingId(file.id);

    try {
      await downloadSubmissionFile(submission.id, file.id, file.originalName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to download file');
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleDecision(decision: ReviewDecision) {
    if (!submission) {
      return;
    }

    if (decision !== 'APPROVED' && !feedback.trim()) {
      setError('Feedback is required when you request a revision or reject the work.');
      return;
    }

    const message =
      decision === 'APPROVED' ? 'Approved.' : decision === 'REJECTED' ? 'Rejected.' : 'Revision requested.';
    await run(decision, async () => (await reviewSubmission(submission.id, decision, feedback)).submission, message);
  }

  if (!id) {
    return <BackToSubmissions message="Invalid submission ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading submission...</p>;
  }

  if (error && !submission) {
    return <BackToSubmissions message={error} />;
  }

  if (!submission) {
    return <BackToSubmissions message="Submission not found" />;
  }

  const reviewable = submission.status === 'SUBMITTED' || submission.status === 'UNDER_REVIEW';

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to="/admin/submissions" className="hover:text-slate-900">
            Submissions
          </Link>
        }
        title={submission.job.title ?? 'Submission'}
        description={`${submission.contributor?.name ?? 'Contributor'} · ${submission.template.name} · Version ${submission.currentVersion || '—'}`}
        action={<StatusBadge label={submissionStatusLabel(submission.status)} />}
      />
      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      {reviewable ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Review</h3>
          <p className="mt-1 text-sm text-slate-600">
            Approve the current version, send it back with feedback, or reject it. Feedback is required for a revision or a rejection.
          </p>
          {submission.status === 'SUBMITTED' ? (
            <button
              type="button"
              className={`${secondaryButtonClass} mt-4`}
              disabled={Boolean(busy)}
              onClick={() => run('start', async () => (await startReview(submission.id)).submission, 'Review started.')}
            >
              {busy === 'start' ? 'Starting...' : 'Start review'}
            </button>
          ) : null}
          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="feedback">
            Reviewer feedback
          </label>
          <textarea
            id="feedback"
            rows={4}
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            className={inputClass}
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={primaryButtonClass} disabled={Boolean(busy)} onClick={() => handleDecision('APPROVED')}>
              {busy === 'APPROVED' ? 'Saving...' : 'Approve'}
            </button>
            <button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => handleDecision('REVISION_REQUIRED')}>
              {busy === 'REVISION_REQUIRED' ? 'Saving...' : 'Request revision'}
            </button>
            <button type="button" className={secondaryButtonClass} disabled={Boolean(busy)} onClick={() => handleDecision('REJECTED')}>
              {busy === 'REJECTED' ? 'Saving...' : 'Reject'}
            </button>
          </div>
        </section>
      ) : null}

      {submission.status === 'APPROVED' ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Content ready</h3>
          <p className="mt-1 text-sm text-slate-600">
            Version {submission.approvedVersion} is the final approved version. Marking it content ready locks that version for export.
          </p>
          <button
            type="button"
            className={`${primaryButtonClass} mt-4`}
            disabled={Boolean(busy)}
            onClick={() => run('ready', async () => (await markContentReady(submission.id)).submission, 'Marked content ready.')}
          >
            {busy === 'ready' ? 'Saving...' : 'Mark content ready'}
          </button>
        </section>
      ) : null}

      {submission.status === 'CONTENT_READY' ? (
        <section className="mb-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900">Export</h3>
          <p className="mt-1 text-sm text-slate-600">
            Download the approved version as structured JSON for the main Ethio Exam platform. This file is the handoff. It does not import the work.
          </p>
          <button
            type="button"
            className={`${primaryButtonClass} mt-4`}
            disabled={Boolean(busy)}
            onClick={() =>
              run(
                'export',
                async () => {
                  await downloadSubmissionExport(submission.id, submission.approvedVersion ?? submission.currentVersion);
                  return submission;
                },
                'Export downloaded.',
              )
            }
          >
            {busy === 'export' ? 'Downloading...' : 'Download export'}
          </button>
        </section>
      ) : null}

      <div className="space-y-4">
        <SubmissionContent submission={submission} onDownload={handleDownload} downloadingId={downloadingId} />
        <ReviewHistory reviews={submission.reviews} />
        <VersionHistory submission={submission} />
        <ActivityHistory entityType="Submission" entityId={submission.id} />
      </div>
    </div>
  );
}
