import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { primaryButtonClass } from '../../components/formStyles';
import { subjectLabel } from '../../constants/contributors';
import { templateTypeLabel } from '../../constants/templates';
import { listTemplates, updateTemplateStatus } from '../../services/templateService';
import type { Template } from '../../types';

export function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listTemplates()
      .then((data) => {
        if (!cancelled) {
          setTemplates(data.templates);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load templates');
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

  async function handleStatus(template: Template) {
    setError('');
    setUpdatingId(template.id);

    try {
      const data = await updateTemplateStatus(template.id, !template.isActive);
      setTemplates((current) =>
        current.map((item) => (item.id === data.template.id ? data.template : item)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update template');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Templates"
        description="A template is the structure of a submission. Jobs keep a copy, so later edits do not rewrite work already assigned."
        action={
          <Link to="/admin/templates/new" className={primaryButtonClass}>
            Create Template
          </Link>
        }
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading templates...</LoadingState>
        ) : templates.length === 0 ? (
          <EmptyState title="No templates yet">Create one before you ask contributors to submit structured work.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Fields</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <Link to={`/admin/templates/${template.id}`} className="underline">
                        {template.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{subjectLabel(template.subject)}</td>
                    <td className="px-4 py-3">{templateTypeLabel(template.type)}</td>
                    <td className="px-4 py-3">{template.fields.length}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={template.isActive ? 'Active' : 'Inactive'} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link to={`/admin/templates/${template.id}/edit`} className="underline">
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={updatingId === template.id}
                          onClick={() => handleStatus(template)}
                          className="underline disabled:opacity-60"
                        >
                          {template.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
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
