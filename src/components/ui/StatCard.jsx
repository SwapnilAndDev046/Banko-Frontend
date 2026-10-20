export default function StatCard({ label, value, hint, icon: Icon }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="muted text-sm font-medium">{label}</p>
        {Icon && <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
      {hint && <p className="muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}
