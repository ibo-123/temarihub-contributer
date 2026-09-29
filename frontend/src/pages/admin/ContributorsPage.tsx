import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { Alert, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { primaryButtonClass } from '../../components/formStyles';
import {
  accountStatusLabel,
  contributorRoleLabel,
  subjectLabel,
  verificationLabel,
} from '../../constants/contributors';
import { updateContributorStatus, listContributors } from '../../services/contributorService';
import type { Contributor } from '../../types';

export function ContributorsPage() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listContributors()
      .then((data) => {
        if (!cancelled) {
          setContributors(data.contributors);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load contributors');
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

  async function handleStatusToggle(contributor: Contributor) {
    setError('');
    setUpdatingId(contributor.id);

    try {
      const data = await updateContributorStatus(contributor.id, !contributor.isActive);
      setContributors((current) =>
        current.map((item) => (item.id === data.contributor.id ? data.contributor : item)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Contributors"
        description="Each contributor has one work role and one subject. Only active accounts can sign in."
        action={
          <Link to="/admin/contributors/new" className={primaryButtonClass}>
            Add Contributor
          </Link>
        }
      />

      {error ? <Alert>{error}</Alert> : null}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <LoadingState>Loading contributors...</LoadingState>
        ) : contributors.length === 0 ? (
          <EmptyState title="No contributors yet">Add a contributor before assigning a job.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Account Status</th>
                  <th className="px-4 py-3 font-medium">Academic Verification</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contributors.map((contributor) => (
                  <tr key={contributor.id} className="border-b border-slate-100 transition hover:bg-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-900">{contributor.name}</td>
                    <td className="px-4 py-3 text-slate-700">{contributor.email}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {contributorRoleLabel(contributor.contributorRole)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{subjectLabel(contributor.subject)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge label={accountStatusLabel(contributor.isActive)} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge label={verificationLabel(contributor.academicVerificationStatus)} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 whitespace-nowrap">
                        <Link
                          to={`/admin/contributors/${contributor.id}`}
                          className="text-slate-900 underline"
                        >
                          View
                        </Link>
                        <Link
                          to={`/admin/contributors/${contributor.id}/edit`}
                          className="text-slate-900 underline"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={updatingId === contributor.id}
                          onClick={() => handleStatusToggle(contributor)}
                          className="text-slate-900 underline disabled:opacity-60"
                        >
                          {contributor.isActive ? 'Deactivate' : 'Activate'}
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
