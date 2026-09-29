import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ReviewHistory } from '../../components/ReviewHistory';
import { SubmissionContent } from '../../components/SubmissionContent';
import { Alert, PageHeader } from '../../components/ui';
import { inputClass, primaryButtonClass, secondaryButtonClass } from '../../components/formStyles';
import { deadlineHasPassed } from '../../constants/jobs';
import { ApiRequestError } from '../../services/api';
import { getMyJob } from '../../services/jobService';
import {
  createSubmission,
  downloadSubmissionFile,
  getMySubmission,
  removeSubmissionFile,
  resubmitSubmission,
  submitSubmission,
  updateSubmission,
  uploadSubmissionFiles,
} from '../../services/submissionService';
import type { ContributorJob, Submission, SubmissionFile, SubmissionItem, TemplateField } from '../../types';

function itemReady(row: Record<string, string>, fields: TemplateField[]) {
  return fields.every((field) => !field.required || (row[field.name] ?? '').trim() !== '');
}

function itemPreview(row: Record<string, string>, fields: TemplateField[]) {
  const field = fields.find((item) => (row[item.name] ?? '').trim());
  if (!field) {
    return 'Not started';
  }

  const text = row[field.name].trim();
  return text.length > 72 ? `${text.slice(0, 72)}…` : text;
}

function latestFeedback(submission: Submission, decision: 'REVISION_REQUIRED' | 'REJECTED') {
  const match = [...(submission.reviews ?? [])].reverse().find((review) => review.decision === decision);
  return match?.feedback ?? '';
}

function blankRow(fields: TemplateField[]) {
  return Object.fromEntries(fields.map((field) => [field.name, '']));
}

function rowsFromSubmission(submission: Submission, quantity: number, fields: TemplateField[]) {
  const sorted = [...submission.items].sort((left, right) => left.order - right.order);
  const rows = sorted.map((item) => {
    const row = blankRow(fields);
    fields.forEach((field) => {
      const value = item.values[field.name];
      row[field.name] = value === null || value === undefined ? '' : String(value);
    });
    return row;
  });

  while (rows.length < quantity) {
    rows.push(blankRow(fields));
  }

  return rows.slice(0, quantity);
}

function rowsToItems(rows: Record<string, string>[], fields: TemplateField[]): SubmissionItem[] | string {
  const items: SubmissionItem[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const values: Record<string, string | number | null> = {};

    for (const field of fields) {
      const raw = row[field.name] ?? '';
      if (field.type === 'number') {
        if (raw.trim() === '') {
          values[field.name] = null;
        } else {
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) {
            return `Item ${index + 1}: ${field.label} must be a number`;
          }
          values[field.name] = parsed;
        }
      } else {
        values[field.name] = raw;
      }
    }

    items.push({ order: index + 1, values });
  }

  return items;
}

function BackLink({ message }: { message: string }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <p className="text-red-600">{message}</p>
      <Link to="/contributor/jobs" className="mt-4 inline-block text-sm text-slate-900 underline">
        Back to my jobs
      </Link>
    </section>
  );
}

export function SubmissionPage() {
  const { jobId } = useParams();
  const [job, setJob] = useState<ContributorJob | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState(0);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!jobId) {
      return;
    }

    let cancelled = false;

    async function load(id: string) {
      try {
        const jobData = await getMyJob(id);
        const loadedJob = jobData.job;
        let existing = (await getMySubmission(id)).submission;
        const canCreate =
          Boolean(loadedJob.template) &&
          (loadedJob.status === 'ASSIGNED' || loadedJob.status === 'IN_PROGRESS');

        if (!existing && canCreate) {
          try {
            existing = (await createSubmission(id)).submission;
          } catch (err: unknown) {
            if (err instanceof ApiRequestError && err.status === 409) {
              existing = (await getMySubmission(id)).submission;
            } else {
              throw err;
            }
          }
        }

        if (!cancelled) {
          setJob(loadedJob);
          setSubmission(existing);
          if (existing && loadedJob.template) {
            const templateFields = loadedJob.template.fields;
            const nextRows = rowsFromSubmission(existing, loadedJob.quantity, templateFields);
            const gap = nextRows.findIndex((row) => !itemReady(row, templateFields));
            setRows(nextRows);
            setOpenIndex(gap === -1 ? 0 : gap);
            setNotes(existing.notes);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load submission');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load(jobId);

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  function updateCell(index: number, name: string, value: string) {
    setNotice('');
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [name]: value } : row)),
    );
  }

  function currentItems() {
    if (!job?.template) {
      return 'This job does not have a submission template yet';
    }

    return rowsToItems(rows, job.template.fields);
  }

  async function handleSave(event?: FormEvent) {
    event?.preventDefault();
    if (!submission) {
      return;
    }

    const items = currentItems();
    if (typeof items === 'string') {
      setError(items);
      return;
    }

    setError('');
    setNotice('');
    setSaving(true);

    try {
      const data = await updateSubmission(submission.id, { items, notes });
      setSubmission(data.submission);
      if (job?.template) {
        setRows(rowsFromSubmission(data.submission, job.quantity, job.template.fields));
      }
      setNotes(data.submission.notes);
      setNotice(
        data.submission.status === 'REVISION_REQUIRED'
          ? 'Changes saved. Resubmit when the requested updates are done.'
          : 'Draft saved. You can leave and continue later.',
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to save draft');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!submission || !job) {
      return;
    }

    const items = currentItems();
    if (typeof items === 'string') {
      setError(items);
      return;
    }

    if (job.template) {
      const templateFields = job.template.fields;
      const gap = rows.findIndex((row) => !itemReady(row, templateFields));
      if (gap !== -1) {
        setOpenIndex(gap);
        setNotice('');
        setError(`Item ${gap + 1} is missing required fields.`);
        return;
      }
    }

    setError('');
    setNotice('');
    setSending(true);

    try {
      const saved = await updateSubmission(submission.id, { items, notes });
      const revising = saved.submission.status === 'REVISION_REQUIRED';
      const sent = revising
        ? await resubmitSubmission(saved.submission.id)
        : await submitSubmission(saved.submission.id);
      setSubmission(sent.submission);
      setNotice(revising ? 'Revision sent for review.' : 'Submitted for review.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to submit');
      const refreshed = await getMySubmission(job.id).catch(() => null);
      if (refreshed?.submission) {
        setSubmission(refreshed.submission);
      }
    } finally {
      setSending(false);
    }
  }

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    if (!submission) {
      return;
    }

    const selected = event.target.files ? Array.from(event.target.files) : [];
    event.target.value = '';
    if (selected.length === 0) {
      return;
    }

    setError('');

    try {
      const data = await uploadSubmissionFiles(submission.id, selected);
      setSubmission(data.submission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to upload files');
    }
  }

  async function handleRemove(fileId: string) {
    if (!submission) {
      return;
    }

    setError('');

    try {
      const data = await removeSubmissionFile(submission.id, fileId);
      setSubmission(data.submission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to remove file');
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

  if (!jobId) {
    return <BackLink message="Invalid job ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading submission...</p>;
  }

  if (!job) {
    return <BackLink message={error || 'Job not found'} />;
  }

  if (!job.template || !submission) {
    return (
      <BackLink
        message={
          job.template
            ? 'This job is not open for a new submission.'
            : 'This job does not have a submission template yet.'
        }
      />
    );
  }

  const fields = [...job.template.fields].sort((left, right) => left.order - right.order);
  const revising = submission.status === 'REVISION_REQUIRED';
  const locked = submission.status !== 'DRAFT' && !revising;
  const expired = deadlineHasPassed(job.deadline);
  const readyCount = rows.filter((row) => itemReady(row, fields)).length;
  const revisionNote = latestFeedback(submission, 'REVISION_REQUIRED');
  const rejectionNote = latestFeedback(submission, 'REJECTED');

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to={`/contributor/jobs/${job.id}`} className="hover:text-slate-900">
            Back to job
          </Link>
        }
        title={job.title}
        description={`${job.template.name}. This job asks for exactly ${job.quantity} items. Required fields are marked.`}
      />

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      {revising && revisionNote ? <Alert tone="warning">{`Revision requested: ${revisionNote}`}</Alert> : null}
      {submission.status === 'REJECTED' && rejectionNote ? <Alert>{`Rejected: ${rejectionNote}`}</Alert> : null}

      {locked ? (
        <div className="space-y-4">
          <SubmissionContent
            submission={submission}
            onDownload={handleDownload}
            downloadingId={downloadingId}
          />
          <ReviewHistory reviews={submission.reviews} />
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 pb-4">
          <p className="text-sm text-slate-600">
            {readyCount} of {rows.length} items have every required field.
          </p>
          {rows.map((row, index) => {
            const ready = itemReady(row, fields);
            const open = openIndex === index;

            return (
              <section key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-medium text-slate-900">Item {index + 1}</span>
                    <span className="mt-0.5 block truncate text-sm text-slate-500">{itemPreview(row, fields)}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ready ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {ready ? 'Ready' : 'Needs fields'}
                  </span>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-slate-100 px-5 py-5">
                    {fields.map((field) => (
                      <div key={field.name}>
                        <label className="block text-sm font-medium text-slate-700" htmlFor={`${field.name}-${index}`}>
                          {field.label}
                          {field.required ? <span className="text-slate-400"> · required</span> : null}
                        </label>
                        {field.description ? (
                          <p className="text-xs text-slate-500">{field.description}</p>
                        ) : null}
                        {field.type === 'textarea' ? (
                          <textarea
                            id={`${field.name}-${index}`}
                            rows={3}
                            placeholder={field.placeholder}
                            value={row[field.name] ?? ''}
                            onChange={(event) => updateCell(index, field.name, event.target.value)}
                            className={inputClass}
                          />
                        ) : field.type === 'select' ? (
                          <select
                            id={`${field.name}-${index}`}
                            value={row[field.name] ?? ''}
                            onChange={(event) => updateCell(index, field.name, event.target.value)}
                            className={inputClass}
                          >
                            <option value="">Select</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            id={`${field.name}-${index}`}
                            type={field.type === 'number' ? 'number' : 'text'}
                            placeholder={field.placeholder}
                            value={row[field.name] ?? ''}
                            onChange={(event) => updateCell(index, field.name, event.target.value)}
                            className={inputClass}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="block text-sm font-medium text-slate-700" htmlFor="notes">
              Notes
            </label>
            <p className="text-xs text-slate-500">Optional context for whoever reads this submission later.</p>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(event) => {
                setNotice('');
                setNotes(event.target.value);
              }}
              className={inputClass}
            />

            <div className="mt-6">
              <p className="text-sm font-medium text-slate-700">Supporting files</p>
              <label
                htmlFor="files"
                className="mt-2 flex cursor-pointer flex-col items-center rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="text-sm font-medium text-slate-900">Choose files</span>
                <span className="mt-1 text-xs text-slate-500">
                  PDF, Word, Excel, text, CSV, PNG, or JPEG. Several files can sit on this one submission.
                </span>
                <input
                  id="files"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xlsx,.txt,.csv,.png,.jpg,.jpeg"
                  onChange={handleFiles}
                  className="sr-only"
                />
              </label>
              {submission.files.length > 0 ? (
                <ul className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {submission.files.map((file) => (
                    <li key={file.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                      <button type="button" onClick={() => handleDownload(file)} className="truncate text-left underline">
                        {file.originalName}
                        <span className="ml-2 text-slate-500">({Math.ceil(file.size / 1024)} KB)</span>
                      </button>
                      <button type="button" onClick={() => handleRemove(file.id)} className="shrink-0 text-red-700">
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>

          <ReviewHistory reviews={submission.reviews} />

          <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
            <p className="text-sm text-slate-600">
              {expired && !revising
                ? 'The deadline has passed. This draft can be saved, but it can no longer be submitted.'
                : `${readyCount} of ${rows.length} ready to ${revising ? 'resubmit' : 'submit'}`}
            </p>
            <div className="flex gap-3">
              <button type="submit" disabled={saving || sending} className={secondaryButtonClass}>
                {saving ? 'Saving...' : revising ? 'Save changes' : 'Save Draft'}
              </button>
              <button
                type="button"
                disabled={saving || sending || (expired && !revising)}
                onClick={handleSubmit}
                className={primaryButtonClass}
              >
                {sending ? 'Submitting...' : revising ? 'Resubmit' : 'Submit'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
