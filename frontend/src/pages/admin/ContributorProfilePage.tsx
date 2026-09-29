import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityHistory } from '../../components/ActivityHistory';
import { StatusBadge } from '../../components/StatusBadge';
import {
  accountStatusLabel,
  contributorRoleLabel,
  subjectLabel,
  verificationLabel,
} from '../../constants/contributors';
import { getContributor } from '../../services/contributorService';
import type { Contributor } from '../../types';

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function ContributorProfilePage() {
  const { id } = useParams();
  const [contributor, setContributor] = useState<Contributor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    getContributor(id)
      .then((data) => {
        if (!cancelled) {
          setContributor(data.contributor);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load contributor');
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

  if (error || !contributor) {
    return (
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <p className="text-red-600">{error || 'Contributor not found'}</p>
        <Link to="/admin/contributors" className="mt-4 inline-block text-sm text-slate-900 underline">
          Back to contributors
        </Link>
      </section>
    );
  }

  const fields = [
    { label: 'Name', value: contributor.name },
    { label: 'Email', value: contributor.email },
    { label: 'Role', value: contributorRoleLabel(contributor.contributorRole) },
    { label: 'Subject', value: subjectLabel(contributor.subject) },
    { label: 'Created', value: formatTimestamp(contributor.createdAt) },
    { label: 'Updated', value: formatTimestamp(contributor.updatedAt) },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Link to="/admin/contributors" className="text-sm text-slate-600 underline">
            Contributors
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">Contributor Profile</h2>
        </div>
        <Link
          to={`/admin/contributors/${contributor.id}/edit`}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Edit
        </Link>
      </div>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <dl className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="mt-1 text-slate-900">{field.value}</dd>
            </div>
          ))}
          <div>
            <dt className="text-sm text-slate-500">Account Status</dt>
            <dd className="mt-1">
              <StatusBadge label={accountStatusLabel(contributor.isActive)} />
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Academic Verification</dt>
            <dd className="mt-1">
              <StatusBadge label={verificationLabel(contributor.academicVerificationStatus)} />
            </dd>
          </div>
        </dl>
      </section>
      <ActivityHistory entityType="Contributor" entityId={contributor.id} />
    </div>
  );
}
