import { EmptyState } from './States';

// columns: [{ key, header, render?(row), align? }]
export default function DataTable({ columns, rows, rowKey, empty = 'Nothing to show yet.' }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-800">
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={`px-4 py-3 font-semibold ${c.align === 'right' ? 'text-right' : ''}`}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row, i) => (
            <tr key={rowKey ? rowKey(row, i) : i}>
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 ${c.align === 'right' ? 'text-right tabular-nums' : ''}`}>
                  {c.render ? c.render(row) : row[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
