import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { submissionStatusLabel } from '../../constants/templates';
import { listMySubmissions } from '../../services/submissionService';
import type { Submission } from '../../types';

function formatTimestamp(value: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function ContributorSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
          setError(err instanceof Error ? err.message : 'Unable to load submissions');
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
        title="Submissions"
        description="Drafts stay editable. Submitted work shows the status and the date it was sent."
      />
      {error ? <Alert>{error}</Alert> : null}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading submissions...</LoadingState>
        ) : submissions.length === 0 ? (
          <EmptyState title="No submissions yet">Open a job and start a submission when you are ready.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Updated</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        to={`/contributor/jobs/${submission.job.id}/submission`}
                        className="underline"
                      >
                        {submission.job.title ?? 'Job'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{submission.template.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={submissionStatusLabel(submission.status)} />
                    </td>
                    <td className="px-4 py-3">{formatTimestamp(submission.updatedAt)}</td>
                    <td className="px-4 py-3">{formatTimestamp(submission.submittedAt)}</td>
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
