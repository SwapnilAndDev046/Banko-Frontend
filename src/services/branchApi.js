import { request } from './apiClient';

/** GET /api/v1/branches/all — authenticated CUSTOMER or ADMIN. */
export function listBranches() {
  return request('/api/v1/branches/all');
}

/** POST /api/v1/branches — ADMIN. */
export function createBranch({ branchName, IFSC_CODE, city, state }) {
  return request('/api/v1/branches', {
    method: 'POST',
    body: { branchName, IFSC_CODE, city, state },
  });
}

/** PUT /api/v1/branches/{id} — ADMIN. Pass the complete BranchDto body. */
export function updateBranch(id, branchDto) {
  return request(`/api/v1/branches/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: branchDto,
  });
}

/** PATCH /api/v1/branches/{id} — ADMIN. Pass only the changed fields. */
export function patchBranch(id, changes) {
  return request(`/api/v1/branches/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: changes,
  });
}

/** DELETE /api/v1/branches/{id} — ADMIN. */
export function deleteBranch(id) {
  return request(`/api/v1/branches/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
