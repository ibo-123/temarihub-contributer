import type { ReactNode } from 'react';

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2 text-sm text-slate-500">{eyebrow}</div> : null}
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Alert({ tone = 'error', children }: { tone?: 'error' | 'warning' | 'success'; children: ReactNode }) {
  const tones = {
    error: 'border-red-200 bg-red-50 text-red-700',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    success: 'border-green-200 bg-green-50 text-green-800',
  };

  return <p className={`mb-4 rounded-md border px-3 py-2 text-sm ${tones[tone]}`}>{children}</p>;
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      {children ? <p className="mx-auto mt-1 max-w-md text-sm text-slate-600">{children}</p> : null}
    </div>
  );
}

export function LoadingState({ children }: { children: ReactNode }) {
  return <p className="px-6 py-10 text-sm text-slate-500">{children}</p>;
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>
  );
}
