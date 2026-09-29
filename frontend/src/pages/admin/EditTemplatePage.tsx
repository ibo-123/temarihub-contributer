import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TemplateForm } from '../../components/TemplateForm';
import type { TemplateFormValues } from '../../utils/templateInput';
import { buildTemplateInput, fieldsToDrafts } from '../../utils/templateInput';
import { getTemplate, updateTemplate } from '../../services/templateService';
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

export function EditTemplatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

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
          setLoadError(err instanceof Error ? err.message : 'Unable to load template');
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

  async function handleSubmit(values: TemplateFormValues) {
    if (!id) {
      return;
    }

    const input = buildTemplateInput(values);
    if (typeof input === 'string') {
      setError(input);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await updateTemplate(id, input);
      navigate(`/admin/templates/${data.template.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update template');
    } finally {
      setSubmitting(false);
    }
  }

  if (!id) {
    return <BackToTemplates message="Invalid template ID" />;
  }

  if (loading) {
    return <p className="text-slate-600">Loading template...</p>;
  }

  if (loadError || !template) {
    return <BackToTemplates message={loadError || 'Template not found'} />;
  }

  const initialValues: TemplateFormValues = {
    name: template.name,
    description: template.description,
    subject: template.subject,
    type: template.type,
    isActive: template.isActive,
    fields: fieldsToDrafts(template.fields),
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Edit Template</h2>
      <TemplateForm
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        error={error}
        cancelTo={`/admin/templates/${id}`}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
