import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
};

export default function Button({ variant = 'primary', loading = false, disabled = false, className = '', children, ...props }) {
  return (
    <button className={`${VARIANTS[variant]} ${className}`} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
