import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiRequestError, apiRequest } from '../../services/api';

const actions = [
  {
    to: '/contributor/jobs',
    title: 'My Jobs',
    text: 'Open an assigned job to see the template, quantity, and deadline.',
  },
  {
    to: '/contributor/submissions',
    title: 'Submissions',
    text: 'Continue a draft, revise requested changes, or check the status of work you already sent.',
  },
];

export function ContributorDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    apiRequest('/api/contributor/dashboard').catch((err: unknown) => {
      if (cancelled) {
        return;
      }

      if (err instanceof ApiRequestError && (err.status === 401 || err.status === 403)) {
        logout();
        navigate('/login', { replace: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [logout, navigate]);

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome, {user?.name}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Fill every required field, save a draft whenever you stop, and submit only when the full quantity is ready. If a reviewer asks for changes, edit that submission and resubmit.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400"
          >
            <h3 className="font-medium text-slate-900">{action.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
