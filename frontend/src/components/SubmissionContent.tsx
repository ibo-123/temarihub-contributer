import type { Submission, SubmissionFile } from '../types';
import { submissionStatusLabel } from '../constants/templates';
import { StatusBadge } from './StatusBadge';

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

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return String(value);
}

export function SubmissionContent({
  submission,
  onDownload,
  downloadingId,
}: {
  submission: Submission;
  onDownload: (file: SubmissionFile) => void;
  downloadingId: string | null;
}) {
  const fields = [...submission.template.fields].sort((left, right) => left.order - right.order);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge label={submissionStatusLabel(submission.status)} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Submitted</dt>
            <dd className="mt-1 text-slate-900">{formatTimestamp(submission.submittedAt)}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Notes</dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">{submission.notes || 'None'}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900">Structured work</h3>
        <div className="mt-4 space-y-4">
          {submission.items.map((item) => (
            <article key={item.order} className="rounded border border-slate-200 p-4">
              <h4 className="font-medium text-slate-900">Item {item.order}</h4>
              <dl className="mt-3 space-y-3">
                {fields.map((field) => (
                  <div key={field.name}>
                    <dt className="text-sm text-slate-500">{field.label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap text-slate-900">
                      {displayValue(item.values[field.name])}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900">Files</h3>
        {submission.files.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No files attached.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {submission.files.map((file) => (
              <li key={file.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <span className="text-slate-900">
                  {file.originalName}{' '}
                  <span className="text-slate-500">({Math.ceil(file.size / 1024)} KB)</span>
                </span>
                <button
                  type="button"
                  disabled={downloadingId === file.id}
                  onClick={() => onDownload(file)}
                  className="underline disabled:opacity-60"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
