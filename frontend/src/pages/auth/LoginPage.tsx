import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert } from '../../components/ui';
import { inputClass, primaryButtonClass } from '../../components/formStyles';
import { dashboardPath } from '../../components/ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to={dashboardPath(user.role)} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const loggedInUser = await login(email, password);
      navigate(dashboardPath(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-slate-50 lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 px-12 py-14 text-white lg:flex">
        <p className="text-sm font-medium tracking-wide text-slate-400">Contributor Website</p>
        <div>
          <h1 className="max-w-md text-4xl font-semibold tracking-tight">
            Prepare work in the structure the platform can use.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
            Admins assign a job and a template. Contributors fill the required fields, attach
            supporting files, and submit when the work is complete.
          </p>
        </div>
        <p className="text-sm text-slate-500">Sign in with the account you were given.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-16">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <p className="text-sm font-medium text-slate-500 lg:hidden">Contributor Website</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600">Use your admin or contributor account.</p>

          <label className="mt-8 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />

          <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
          />

          {error ? (
            <div className="mt-4">
              <Alert>{error}</Alert>
            </div>
          ) : null}

          <button type="submit" disabled={submitting} className={`${primaryButtonClass} mt-6 w-full py-2.5`}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </div>
  );
}
