import { ApiError, request, tokenStore } from './apiClient';

/**
 * POST /api/v1/register — public customer registration.
 * SignupRequestDto fields: name, email, phoneNumber, password.
 */
export function register({ name, email, phoneNumber, password }) {
  return request('/api/v1/register', {
    method: 'POST',
    auth: false,
    body: { name, email, phoneNumber, password },
  });
}

/**
 * POST /api/v1/login — public login.
 * Expects the backend response to contain a non-empty `token` string.
 * Saves the JWT automatically and returns the token to the caller.
 */
export async function login(email, password) {
  const data = await request('/api/v1/login', {
    method: 'POST',
    auth: false,
    body: { email, password },
  });

  if (!data || typeof data.token !== 'string' || !data.token.trim()) {
    throw new ApiError('The login response did not include a valid token.', 0, data);
  }

  tokenStore.set(data.token);
  return data.token;
}

/** GET /api/v1/auth/me — details for the currently authenticated user. */
export function getCurrentUser() {
  return request('/api/v1/auth/me');
}

/** There is no active server-side logout endpoint in API_ENDPOINTS.json. */
export function logoutLocal() {
  tokenStore.clear();
}
