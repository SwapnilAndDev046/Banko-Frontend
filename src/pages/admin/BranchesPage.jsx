import { useState } from 'react';
import { useAsync } from '../../hooks/useAsync';
import * as branchApi from '../../services/branchApi';
import DataTable from '../../components/ui/DataTable';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Alert, ErrorState, LoadingState } from '../../components/ui/States';

const BASE_COLUMNS = [
  { key: 'branchName', header: 'Branch name' },
  { key: 'IFSC_CODE', header: 'IFSC code' },
  { key: 'city', header: 'City' },
  { key: 'state', header: 'State' },
];
const EMPTY = { branchName: '', IFSC_CODE: '', city: '', state: '' };
const FIELDS = [
  { key: 'branchName', label: 'Branch name', id: 'branch-name' },
  { key: 'IFSC_CODE', label: 'IFSC code', id: 'branch-ifsc' },
  { key: 'city', label: 'City', id: 'branch-city' },
  { key: 'state', label: 'State', id: 'branch-state' },
];

export default function BranchesPage() {
  const list = useAsync(() => branchApi.listBranches(), []);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY);
  const [editResult, setEditResult] = useState(null);
  const [editBusy, setEditBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const branches = Array.isArray(list.data) ? list.data : [];
  const supportsIds = branches.some((branch) => branch.id !== undefined && branch.id !== null);

  const setCreateField = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const setEditField = (key) => (event) => setEditForm((current) => ({ ...current, [key]: event.target.value }));

  function validate(values) {
    const next = {};
    if (!values.branchName.trim()) next.branchName = 'Enter the branch name.';
    if (!values.IFSC_CODE.trim()) next.IFSC_CODE = 'Enter the IFSC code.';
    if (!values.city.trim()) next.city = 'Enter the city.';
    if (!values.state.trim()) next.state = 'Enter the state.';
    return next;
  }

  async function submitCreate(event) {
    event.preventDefault();
    if (busy) return;
    const next = validate(form);
    setErrors(next);
    setResult(null);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await branchApi.createBranch({
        branchName: form.branchName.trim(),
        IFSC_CODE: form.IFSC_CODE.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
      });
      setForm(EMPTY);
      setResult({ ok: true, message: 'Branch created.' });
      list.reload();
    } catch (error) {
      setResult({ ok: false, message: error.message });
    } finally {
      setBusy(false);
    }
  }

  function beginEdit(branch) {
    if (branch.id == null) return;
    setEditing(branch);
    setEditForm({
      branchName: branch.branchName || '',
      IFSC_CODE: branch.IFSC_CODE || '',
      city: branch.city || '',
      state: branch.state || '',
    });
    setEditResult(null);
  }

  async function saveEdit(mode) {
    if (!editing || editBusy) return;
    const next = validate(editForm);
    if (Object.keys(next).length) {
      setEditResult({ ok: false, message: Object.values(next).join(' ') });
      return;
    }
    const changes = {};
    for (const key of Object.keys(EMPTY)) {
      const value = editForm[key].trim();
      if (value !== (editing[key] || '')) changes[key] = value;
    }
    if (!Object.keys(changes).length) {
      setEditResult({ ok: true, message: 'No changes to save.' });
      return;
    }

    setEditBusy(true);
    setEditResult(null);
    try {
      if (mode === 'put') {
        await branchApi.updateBranch(editing.id, {
          branchName: editForm.branchName.trim(),
          IFSC_CODE: editForm.IFSC_CODE.trim(),
          city: editForm.city.trim(),
          state: editForm.state.trim(),
        });
      } else {
        await branchApi.patchBranch(editing.id, changes);
      }
      setResult({ ok: true, message: mode === 'put' ? 'Branch updated.' : 'Changed branch fields updated.' });
      setEditing(null);
      list.reload();
    } catch (error) {
      setEditResult({ ok: false, message: error.message });
    } finally {
      setEditBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteTarget.id == null || deleteBusy) return;
    setDeleteBusy(true);
    setResult(null);
    try {
      await branchApi.deleteBranch(deleteTarget.id);
      setDeleteTarget(null);
      setResult({ ok: true, message: 'Branch deleted.' });
      if (editing?.id === deleteTarget.id) setEditing(null);
      list.reload();
    } catch (error) {
      setDeleteTarget(null);
      setResult({ ok: false, message: error.message });
    } finally {
      setDeleteBusy(false);
    }
  }

  const columns = supportsIds ? [...BASE_COLUMNS, {
    key: 'actions',
    header: 'Actions',
    render: (branch) => branch.id == null
      ? <span className="muted text-xs">ID unavailable</span>
      : <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={() => beginEdit(branch)}>Edit</Button>
          <Button type="button" variant="danger" onClick={() => setDeleteTarget(branch)}>Delete</Button>
        </div>,
  }] : BASE_COLUMNS;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Branches</h1>
      {!list.loading && list.data && branches.length > 0 && !supportsIds && <Alert tone="info">Branch creation and listing are available now. Edit and delete controls will appear when the backend includes the branch database <code>id</code> in <code>BranchDto</code>.</Alert>}
      {result && <Alert tone={result.ok ? 'success' : 'error'}>{result.message}</Alert>}

      <form onSubmit={submitCreate} noValidate className="card space-y-4 p-6">
        <h2 className="text-lg font-bold">Add a branch</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((field) => (
            <FormField key={field.key} label={field.label} id={field.id} value={form[field.key]} onChange={setCreateField(field.key)} error={errors[field.key]} disabled={busy} />
          ))}
        </div>
        <Button type="submit" loading={busy}>Create branch</Button>
      </form>

      {editing && (
        <form onSubmit={(event) => { event.preventDefault(); saveEdit('put'); }} noValidate className="card space-y-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Edit {editing.branchName}</h2>
            <Button type="button" variant="secondary" disabled={editBusy} onClick={() => setEditing(null)}>Cancel</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <FormField key={field.key} label={field.label} id={`edit-${field.id}`} value={editForm[field.key]} onChange={setEditField(field.key)} disabled={editBusy} />
            ))}
          </div>
          {editResult && <Alert tone={editResult.ok ? 'success' : 'error'}>{editResult.message}</Alert>}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button type="submit" loading={editBusy}>Save all fields (PUT)</Button>
            <Button type="button" variant="secondary" disabled={editBusy} onClick={() => saveEdit('patch')}>Save changed fields (PATCH)</Button>
          </div>
        </form>
      )}

      <section className="card">
        {list.loading && !list.data ? <LoadingState />
          : list.error ? <ErrorState message={list.error} onRetry={list.reload} />
          : <DataTable columns={columns} rows={branches} rowKey={(branch, index) => branch.id ?? branch.IFSC_CODE ?? index} empty="No branches yet." />}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete branch?"
        confirmLabel="Delete branch"
        busy={deleteBusy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      >
        <p>Delete branch {deleteTarget?.branchName}? The backend may reject deletion if accounts still reference this branch.</p>
      </ConfirmDialog>
    </div>
  );
}
