import { request } from './apiClient';

/**
 * GET /api/v1/customers/pagination — ADMIN.
 * `page` is zero-based and the backend default page size is 5.
 */
export function customersPage(page = 0, size = 5) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  return request(`/api/v1/customers/pagination?${query.toString()}`);
}

/** GET /api/v1/customers/all — ADMIN. */
export function allCustomers() {
  return request('/api/v1/customers/all');
}

/** PUT /api/v1/customers/edits — CUSTOMER; replaces customer details. */
export function replaceProfile({ name, email, phoneNumber }) {
  return request('/api/v1/customers/edits', {
    method: 'PUT',
    body: { name, email, phoneNumber },
  });
}

/** PATCH /api/v1/customers/edit — CUSTOMER; send changed fields only. */
export function updateProfile(changes) {
  return request('/api/v1/customers/edit', {
    method: 'PATCH',
    body: changes,
  });
}

/** DELETE /api/v1/customers/{id} — ADMIN. */
export function deleteCustomer(id) {
  return request(`/api/v1/customers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
