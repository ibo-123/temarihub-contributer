import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ContributorForm,
  type ContributorFormValues,
} from '../../components/ContributorForm';
import {
  isContributorRole,
  isSubject,
  isVerificationStatus,
} from '../../constants/contributors';
import { createContributor } from '../../services/contributorService';

const emptyValues: ContributorFormValues = {
  name: '',
  email: '',
  password: '',
  contributorRole: '',
  subject: '',
  academicVerificationStatus: 'PENDING',
  isActive: true,
};

export function AddContributorPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(values: ContributorFormValues) {
    if (
      !isContributorRole(values.contributorRole) ||
      !isSubject(values.subject) ||
      !isVerificationStatus(values.academicVerificationStatus)
    ) {
      setError('Choose a valid role, subject, and verification status');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const data = await createContributor({
        name: values.name,
        email: values.email,
        password: values.password,
        contributorRole: values.contributorRole,
        subject: values.subject,
        academicVerificationStatus: values.academicVerificationStatus,
        isActive: values.isActive,
      });
      navigate(`/admin/contributors/${data.contributor.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to create contributor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Add Contributor</h2>
      <ContributorForm
        mode="create"
        initialValues={emptyValues}
        submitting={submitting}
        error={error}
        cancelTo="/admin/contributors"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
