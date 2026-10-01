import { DashboardLayout } from './DashboardLayout';

const contributorNav = [
  { to: 'dashboard', label: 'Dashboard', end: true },
  { to: 'jobs', label: 'My Jobs' },
  { to: 'submissions', label: 'Submissions' },
  { to: 'submit-resource', label: 'Topic Resource' },
];

export function ContributorLayout() {
  return <DashboardLayout title="Contributor" navItems={contributorNav} />;
}
