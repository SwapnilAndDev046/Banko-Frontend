import { useEffect } from 'react';
import Button from './Button';

export default function ConfirmDialog({ open, title, children, confirmLabel = 'Confirm', busy = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="card w-full max-w-md p-6">
        <h2 id="confirm-title" className="text-lg font-bold">{title}</h2>
        <div className="muted mt-3 text-sm">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>Cancel</Button>
          <Button onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
