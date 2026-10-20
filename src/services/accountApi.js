import { request } from './apiClient';

/** POST /api/v1/accounts/create — CUSTOMER. */
export function createAccount({ initialDeposit, branchName }) {
  return request('/api/v1/accounts/create', {
    method: 'POST',
    body: { initialDeposit, branchName },
  });
}

/** GET /api/v1/accounts/my-accounts — accounts belonging to the logged-in CUSTOMER. */
export function myAccounts() {
  return request('/api/v1/accounts/my-accounts');
}

/** GET /api/v1/accounts/all — ADMIN. */
export function allAccounts() {
  return request('/api/v1/accounts/all');
}

/** GET /api/v1/accounts/{accountNumber}/balance — CUSTOMER. */
export function balanceMessage(accountNumber) {
  return request(`/api/v1/accounts/${encodeURIComponent(accountNumber)}/balance`);
}

/** PUT /api/v1/accounts/{id} — ADMIN. Pass the UpdateAccountDto body. */
export function updateAccount(id, updateAccountDto) {
  return request(`/api/v1/accounts/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: updateAccountDto,
  });
}

/** Convenience helper when the admin UI changes only the status field. */
export function updateAccountStatus(id, status) {
  return updateAccount(id, { status });
}

/** DELETE /api/v1/accounts/{id} — ADMIN. */
export function deleteAccount(id) {
  return request(`/api/v1/accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
