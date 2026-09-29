const tones: Record<string, string> = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-slate-200 text-slate-700',
  Pending: 'bg-amber-100 text-amber-900',
  Verified: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Draft: 'bg-slate-200 text-slate-700',
  Submitted: 'bg-blue-100 text-blue-800',
  'Under Review': 'bg-indigo-100 text-indigo-800',
  'Revision Required': 'bg-amber-100 text-amber-900',
  Approved: 'bg-green-100 text-green-800',
  'Content Ready': 'bg-teal-100 text-teal-900',
  Assigned: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-amber-100 text-amber-900',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
  Easy: 'bg-green-100 text-green-800',
  Medium: 'bg-amber-100 text-amber-900',
  Hard: 'bg-red-100 text-red-800',
};

export function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[label] ?? 'bg-slate-100 text-slate-700'}`}
    >
      {label}
    </span>
  );
}
