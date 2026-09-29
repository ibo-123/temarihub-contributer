import { DashboardLayout } from './DashboardLayout';

const adminNav = [
  { to: 'dashboard', label: 'Dashboard', end: true },
  { to: 'contributors', label: 'Contributors' },
  { to: 'jobs', label: 'Jobs' },
  { to: 'templates', label: 'Templates' },
  { to: 'submissions', label: 'Submissions' },
  { to: 'content', label: 'Content' },
  { to: 'activity', label: 'Activity' },
];

export function AdminLayout() {
  return <DashboardLayout title="Admin" navItems={adminNav} />;
}
