import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

// The API provides only a stored transaction type, amount, time and reference.
// It does not reliably distinguish a transfer-out from another debit, so labels stay neutral.
export function activityLabel(type) {
  if (type === 'DEPOSIT') return 'Credit';
  if (type === 'TRANSFER') return 'Transfer';
  if (type) return 'Debit';
  return 'Other';
}

const COLUMNS = [
  { key: 'transactionTime', header: 'Date', render: (row) => formatDate(row.transactionTime) },
  { key: 'transactionType', header: 'Activity', render: (row) => <StatusBadge label={activityLabel(row.transactionType)} /> },
  { key: 'referenceId', header: 'Reference' },
  { key: 'amount', header: 'Amount', align: 'right', render: (row) => formatCurrency(row.amount) },
];

export default function TransactionTable({ rows, limit }) {
  const sorted = [...rows].sort((a, b) => new Date(b.transactionTime) - new Date(a.transactionTime));
  return (
    <DataTable
      columns={COLUMNS}
      rows={limit ? sorted.slice(0, limit) : sorted}
      rowKey={(row, index) => row.referenceId ? `${row.referenceId}-${row.transactionType}-${index}` : index}
      empty="No transactions on this account yet."
    />
  );
}
