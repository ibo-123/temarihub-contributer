import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { subjectLabel } from '../../constants/contributors';
import { submissionStatusLabel } from '../../constants/templates';
import { primaryButtonClass, secondaryButtonClass } from '../../components/formStyles';
import { downloadContentBundle, downloadSubmissionExport, listContentReady } from '../../services/submissionService';
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

export function ContentReadyPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listContentReady()
      .then((data) => {
        if (!cancelled) {
          setSubmissions(data.submissions);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load content');
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

  async function handleBundle() {
    setError('');
    setExporting(true);

    try {
      await downloadContentBundle();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to export content');
    } finally {
      setExporting(false);
    }
  }

  async function handleOne(submission: Submission) {
    setError('');
    setDownloadingId(submission.id);

    try {
      await downloadSubmissionExport(submission.id, submission.approvedVersion ?? submission.currentVersion);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to export submission');
    } finally {
      setDownloadingId(null);
    }
  }

  const subjects = [...new Set(submissions.map((submission) => submission.job.subject ?? submission.template.subject))];

  return (
    <div>
      <PageHeader
        title="Content ready"
        description="Approved work that can be exported for the main Ethio Exam platform. Export is the handoff. It does not transfer the content by itself."
        action={
          <button type="button" onClick={handleBundle} disabled={exporting || submissions.length === 0} className={primaryButtonClass}>
            {exporting ? 'Exporting...' : 'Export all'}
          </button>
        }
      />
      {error ? <Alert>{error}</Alert> : null}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading content-ready submissions...</LoadingState>
        ) : submissions.length === 0 ? (
          <EmptyState title="Nothing is content ready yet">Approve a submission, then mark the approved version as content ready.</EmptyState>
        ) : (
          <div className="divide-y divide-slate-100">
            {subjects.map((subject) => {
              const inSubject = submissions.filter(
                (submission) => (submission.job.subject ?? submission.template.subject) === subject,
              );
              const topics = [...new Set(inSubject.map((submission) => submission.job.topic || 'No topic'))];

              return (
                <div key={subject} className="px-5 py-4">
                  <h3 className="text-sm font-medium text-slate-900">{subjectLabel(subject)}</h3>
                  {topics.map((topic) => (
                    <div key={topic} className="mt-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{topic}</p>
                      <ul className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200">
                        {inSubject
                          .filter((submission) => (submission.job.topic || 'No topic') === topic)
                          .map((submission) => (
                            <li key={submission.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 text-sm">
                              <div className="min-w-0">
                                <Link to={`/admin/submissions/${submission.id}`} className="font-medium text-slate-900 underline">
                                  {submission.job.title ?? 'Submission'}
                                </Link>
                                <p className="mt-1 text-slate-500">
                                  {submission.contributor?.name ?? 'Contributor'} · Version {submission.approvedVersion ?? submission.currentVersion} ·{' '}
                                  {formatTimestamp(submission.contentReadyAt)}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge label={submissionStatusLabel(submission.status)} />
                                <button
                                  type="button"
                                  onClick={() => handleOne(submission)}
                                  disabled={downloadingId === submission.id}
                                  className={secondaryButtonClass}
                                >
                                  {downloadingId === submission.id ? 'Downloading...' : 'Download'}
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
