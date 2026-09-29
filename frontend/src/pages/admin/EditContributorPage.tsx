import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ContributorForm,
  type ContributorFormValues,
} from '../../components/ContributorForm';
import {
  isContributorRole,
  isSubject,
  isVerificationStatus,
} from '../../constants/contributors';
import { getContributor, updateContributor } from '../../services/contributorService';

export function EditContributorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState<ContributorFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getContributor(id)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setInitialValues({
          name: data.contributor.name,
          email: data.contributor.email,
          password: '',
          contributorRole: data.contributor.contributorRole ?? '',
          subject: data.contributor.subject ?? '',
          academicVerificationStatus: data.contributor.academicVerificationStatus ?? 'PENDING',
          isActive: data.contributor.isActive,
        });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Unable to load contributor');
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

  async function handleSubmit(values: ContributorFormValues) {
    if (!id) {
      return;
    }

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
      const data = await updateContributor(id, {
        name: values.name,
        email: values.email,
        contributorRole: values.contributorRole,
        subject: values.subject,
        academicVerificationStatus: values.academicVerificationStatus,
        isActive: values.isActive,
      });
      navigate(`/admin/contributors/${data.contributor.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update contributor');
    } finally {
      setSubmitting(false);
    }
  }

  if (!id) {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-red-600">Invalid contributor ID</p>
        <Link to="/admin/contributors" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to contributors
        </Link>
      </section>
    );
  }

  if (loading) {
    return <p className="text-slate-600">Loading contributor...</p>;
  }

  if (loadError || !initialValues) {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-red-600">{loadError || 'Contributor not found'}</p>
        <Link to="/admin/contributors" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to contributors
        </Link>
      </section>
    );
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-semibold text-slate-900">Edit Contributor</h2>
      <ContributorForm
        mode="edit"
        initialValues={initialValues}
        submitting={submitting}
        error={error}
        cancelTo={`/admin/contributors/${id}`}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
