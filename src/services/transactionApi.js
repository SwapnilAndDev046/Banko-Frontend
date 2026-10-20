import { request } from './apiClient';

/** POST /api/v1/transactions/deposit — CUSTOMER. */
export function deposit({ amount, accountNumber }) {
  return request('/api/v1/transactions/deposit', {
    method: 'POST',
    body: { amount, accountNumber },
  });
}

/** POST /api/v1/transactions/transfer — CUSTOMER. */
export function transfer({ senderAccountNumber, receiverAccountNumber, amount }) {
  return request('/api/v1/transactions/transfer', {
    method: 'POST',
    body: { senderAccountNumber, receiverAccountNumber, amount },
  });
}

/** GET /api/v1/transactions/{accountNumber}/history — CUSTOMER. */
export function history(accountNumber) {
  return request(`/api/v1/transactions/${encodeURIComponent(accountNumber)}/history`);
}

// The standalone withdrawal service is intentionally omitted because its
// backend handler is inactive/commented out in API_ENDPOINTS.json.
