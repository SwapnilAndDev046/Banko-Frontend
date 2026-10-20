import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as customerApi from '../../services/customerApi';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Alert, ErrorState, LoadingState } from '../../components/ui/States';

const PAGE_SIZE = 10;
const BASE_COLUMNS = [
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phoneNumber', header: 'Phone number' },
];

export default function CustomersPage() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const result = useAsync(() => customerApi.customersPage(page, PAGE_SIZE), [page]);

  const data = result.data;
  const pageRows = (data && Array.isArray(data.content)) ? data.content : [];
  const supportsIds = pageRows.some((customer) => customer.id !== undefined && customer.id !== null);
  const rows = pageRows.filter((customer) =>
    `${customer.name || ''} ${customer.email || ''} ${customer.phoneNumber || ''}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const columns = supportsIds
    ? [...BASE_COLUMNS, {
        key: 'actions',
        header: 'Actions',
        render: (customer) => customer.id == null
          ? <span className="muted text-xs">ID unavailable</span>
          : <Button type="button" variant="danger" onClick={() => { setNotice(null); setDeleteTarget(customer); }}>Delete</Button>,
      }]
    : BASE_COLUMNS;

  async function confirmDelete() {
    if (!deleteTarget || deleteBusy || deleteTarget.id == null) return;
    setDeleteBusy(true);
    setNotice(null);
    try {
      await customerApi.deleteCustomer(deleteTarget.id);
      setDeleteTarget(null);
      setNotice({ ok: true, message: 'Customer deleted.' });
      result.reload();
    } catch (error) {
      setDeleteTarget(null);
      setNotice({ ok: false, message: error.message });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Customers</h1>
      {!result.loading && data && pageRows.length > 0 && !supportsIds && <Alert tone="info">Customer deletion will be available when the backend includes each customer's database <code>id</code> in <code>CustomerDto</code>. No IDs are fabricated.</Alert>}
      {notice && <Alert tone={notice.ok ? 'success' : 'error'}>{notice.message}</Alert>}
      <section className="card">
        <div className="max-w-sm p-4">
          <FormField label="Search this page" id="customer-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} hint="Searches only the customers loaded on this page." />
        </div>
        {result.loading && !data ? <LoadingState />
          : result.error ? <ErrorState message={result.error} onRetry={result.reload} />
          : <DataTable columns={columns} rows={rows} rowKey={(customer, index) => customer.id ?? customer.email ?? index} empty="No customers found." />}
        {data && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
            <span className="muted">Page {(data.number ?? page) + 1} of {Math.max(1, data.totalPages || 1)}</span>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page === 0 || result.loading} onClick={() => setPage((current) => current - 1)}>Previous</Button>
              <Button variant="secondary" disabled={result.loading || page + 1 >= (data.totalPages || 1)} onClick={() => setPage((current) => current + 1)}>Next</Button>
            </div>
          </div>
        )}
      </section>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer?"
        confirmLabel="Delete customer"
        busy={deleteBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        <p>Delete {deleteTarget?.name || deleteTarget?.email || 'this customer'}? This action cannot be undone. The backend may reject deletion if related accounts or transactions prevent it.</p>
      </ConfirmDialog>
    </div>
  );
}
