import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { submissionStatusLabel } from '../../constants/templates';
import { listSubmissions } from '../../services/submissionService';
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

export function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    listSubmissions()
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
        description="Open a submission to start a review, request a revision, approve it, or reject it."
      />
      {error ? <Alert>{error}</Alert> : null}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading submissions...</LoadingState>
        ) : submissions.length === 0 ? (
          <EmptyState title="No submissions yet">They appear here after a contributor starts a job.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Contributor</th>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => (
                  <tr key={submission.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/submissions/${submission.id}`} className="underline">
                        {submission.job.title ?? 'Job'}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{submission.contributor?.name ?? 'Unknown'}</td>
                    <td className="px-4 py-3">{submission.template.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={submissionStatusLabel(submission.status)} />
                    </td>
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
