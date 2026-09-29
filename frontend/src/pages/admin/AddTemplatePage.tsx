import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TemplateForm } from '../../components/TemplateForm';
import type { TemplateFormValues } from '../../utils/templateInput';
import { buildTemplateInput, emptyField } from '../../utils/templateInput';
import { createTemplate } from '../../services/templateService';

const emptyValues: TemplateFormValues = {
  name: '',
  description: '',
  subject: '',
  type: '',
  isActive: true,
  fields: [emptyField()],
};

export function AddTemplatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: TemplateFormValues) {
    const input = buildTemplateInput(values);
    if (typeof input === 'string') {
      setError(input);
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await createTemplate(input);
      navigate(`/admin/templates/${data.template.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create template');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Create Template</h2>
      <TemplateForm
        mode="create"
        initialValues={emptyValues}
        submitting={submitting}
        error={error}
        cancelTo="/admin/templates"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
