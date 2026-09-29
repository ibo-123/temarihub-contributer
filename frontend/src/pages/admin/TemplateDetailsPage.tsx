import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { subjectLabel } from '../../constants/contributors';
import { fieldTypeLabel, templateTypeLabel } from '../../constants/templates';
import { getTemplate, updateTemplateStatus } from '../../services/templateService';
import type { Template } from '../../types';

function BackToTemplates({ message }: { message: string }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm">
      <p className="text-red-600">{message}</p>
      <Link to="/admin/templates" className="mt-4 inline-block text-sm text-slate-900 underline">
        Back to templates
      </Link>
    </section>
  );
}

export function TemplateDetailsPage() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getTemplate(id)
      .then((data) => {
        if (!cancelled) {
          setTemplate(data.template);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load template');
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

  async function handleStatus() {
    if (!template) {
      return;
    }

    setUpdating(true);

    try {
      const data = await updateTemplateStatus(template.id, !template.isActive);
      setTemplate(data.template);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update template');
    } finally {
      setUpdating(false);
    }
  }

  if (!id) {
    return <BackToTemplates message="Invalid template ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading template...</p>;
  }

  if (!template) {
    return <BackToTemplates message={error || 'Template not found'} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link to="/admin/templates" className="text-sm text-slate-600 underline">
            Templates
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{template.name}</h2>
        </div>
        <div className="flex gap-3">
          <Link
            to={`/admin/templates/${template.id}/edit`}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit
          </Link>
          <button
            type="button"
            disabled={updating}
            onClick={handleStatus}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {template.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <section className="max-w-3xl rounded-lg bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-sm text-slate-500">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-slate-900">
              {template.description || 'None'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Subject</dt>
            <dd className="mt-1 text-slate-900">{subjectLabel(template.subject)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Type</dt>
            <dd className="mt-1 text-slate-900">{templateTypeLabel(template.type)}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Status</dt>
            <dd className="mt-1">
              <StatusBadge label={template.isActive ? 'Active' : 'Inactive'} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Version</dt>
            <dd className="mt-1 text-slate-900">{template.version}</dd>
          </div>
        </dl>

        <h3 className="mt-8 text-lg font-medium text-slate-900">Fields</h3>
        <ol className="mt-3 space-y-3">
          {template.fields.map((field) => (
            <li key={field.name} className="rounded border border-slate-200 p-3 text-sm">
              <p className="font-medium text-slate-900">
                {field.order}. {field.label}
              </p>
              <p className="mt-1 text-slate-600">
                {field.name} · {fieldTypeLabel(field.type)} · {field.required ? 'Required' : 'Optional'}
              </p>
              {field.options.length > 0 ? (
                <p className="mt-1 text-slate-600">Options: {field.options.join(', ')}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
