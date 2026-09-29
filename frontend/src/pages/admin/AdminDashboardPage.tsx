import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const actions = [
  {
    to: '/admin/contributors',
    title: 'Contributors',
    text: 'Create accounts, assign a subject, and activate or deactivate people.',
  },
  {
    to: '/admin/templates',
    title: 'Templates',
    text: 'Define the fields contributors must fill when they submit work.',
  },
  {
    to: '/admin/jobs',
    title: 'Jobs',
    text: 'Assign work, choose a template, and set the quantity and deadline.',
  },
  {
    to: '/admin/submissions',
    title: 'Submissions',
    text: 'Review submitted work, request a revision, approve it, or reject it.',
  },
  {
    to: '/admin/content',
    title: 'Content ready',
    text: 'Export the approved version for handoff to the main platform.',
  },
  {
    to: '/admin/activity',
    title: 'Activity',
    text: 'See who assigned work, submitted it, requested a revision, or approved it.',
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome, {user?.name}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
        Review submitted work, then mark the approved version content ready so it can be exported.
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
