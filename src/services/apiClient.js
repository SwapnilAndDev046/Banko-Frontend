/**
 * Shared HTTP client for the Banko React frontend.
 *
 * Configure the backend origin in the frontend root .env file:
 * VITE_API_BASE_URL=http://localhost:8080
 *
 * Authenticated calls automatically send:
 * Authorization: Bearer <JWT>
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
).replace(/\/$/, '');

const TOKEN_KEY = 'banko.token';

/**
 * Store the JWT for this browser tab/session. sessionStorage survives page
 * refreshes but is cleared when the tab's session ends. This is a practical
 * portfolio-app choice, not a substitute for an HttpOnly-cookie design.
 */
export const tokenStore = {
  get() {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    if (typeof token !== 'string' || !token.trim()) return;
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Storage can be disabled by browser settings.
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // Nothing else is required if storage is unavailable.
    }
  },
};

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

let onUnauthorized = null;

/** Register an optional handler, e.g. to redirect to the login page on 401. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = typeof handler === 'function' ? handler : null;
}

function getErrorMessage(status, data) {
  if (typeof data === 'string' && data.trim()) return data;

  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message.trim()) return data.message;
    if (typeof data.detail === 'string' && data.detail.trim()) return data.detail;
    if (typeof data.error === 'string' && data.error.trim()) return data.error;

    if (Array.isArray(data.errors) && data.errors.length) {
      return data.errors
        .map((item) => (typeof item === 'string' ? item : item?.defaultMessage || item?.message))
        .filter(Boolean)
        .join(', ');
    }
  }

  if (status === 400) return 'The request was invalid. Check the submitted details.';
  if (status === 401) return 'Your session is invalid or has expired. Please log in again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'The requested resource was not found.';
  if (status === 409) return 'This operation conflicts with existing data.';
  if (status >= 500) return 'The Banko server encountered an error. Please try again later.';
  return `Request failed${status ? ` (HTTP ${status})` : ''}.`;
}

async function readResponseBody(response) {
  const raw = await response.text();
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    // Some backend operations can return plain-text messages.
    return raw;
  }
}

/**
 * Make a request to a Spring Boot endpoint.
 *
 * @param {string} path Full backend path, e.g. '/api/v1/auth/me'.
 * @param {{method?: string, body?: unknown, auth?: boolean, headers?: Record<string, string>}} options
 */
export async function request(path, {
  method = 'GET',
  body,
  auth = true,
  headers: extraHeaders = {},
} = {}) {
  const headers = {
    Accept: 'application/json, text/plain, */*',
    ...extraHeaders,
  };

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      'Cannot reach the Banko server. Check that Spring Boot is running and that CORS allows your frontend origin.',
      0,
    );
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && auth) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    throw new ApiError(getErrorMessage(response.status, data), response.status, data);
  }

  return data;
}
