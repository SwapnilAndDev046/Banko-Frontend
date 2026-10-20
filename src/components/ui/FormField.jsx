import { cloneElement } from 'react';

// Label + input + hint/error, wired for screen readers. Pass a child (e.g. <select>) to replace the input.
export default function FormField({ label, id, error, hint, children, ...inputProps }) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const shared = { id, className: 'input', 'aria-invalid': error ? 'true' : 'false', 'aria-describedby': describedBy };
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">{label}</label>
      {children ? cloneElement(children, shared) : <input {...shared} {...inputProps} />}
      {hint && !error && <p id={`${id}-hint`} className="muted mt-1 text-xs">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
