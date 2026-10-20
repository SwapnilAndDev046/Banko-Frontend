import { AlertTriangle, CheckCircle2, Inbox, Info, Loader2 } from 'lucide-react';
import Button from './Button';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div role="status" className="muted flex items-center justify-center gap-2 py-16 text-sm">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <Inbox className="h-8 w-8 text-slate-400" aria-hidden="true" />
      <p className="font-semibold">{title}</p>
      {children && <div className="muted max-w-md text-sm">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
      <p className="max-w-md text-sm">{message}</p>
      {onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

const ALERT_TONES = {
  success: ['bg-green-50 text-green-900 border-green-200 dark:bg-green-500/10 dark:text-green-200 dark:border-green-500/30', CheckCircle2],
  error: ['bg-red-50 text-red-900 border-red-200 dark:bg-red-500/10 dark:text-red-200 dark:border-red-500/30', AlertTriangle],
  warning: ['bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30', AlertTriangle],
  info: ['bg-indigo-50 text-indigo-900 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-200 dark:border-indigo-500/30', Info],
};

export function Alert({ tone = 'info', children }) {
  const [classes, Icon] = ALERT_TONES[tone];
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
