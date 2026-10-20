// Turns any backend error (JSON, plain text, or nothing) into a safe, friendly message.
// Raw exception text, stack traces and SQL errors are never shown.
const BY_STATUS = {
  400: 'The request was not accepted. Please check the details and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that.",
  404: 'We could not find what you asked for.',
  409: 'This conflicts with existing data.',
  500: 'The server ran into a problem. Please try again later.',
};

const UNSAFE = /exception|stack|sql|constraint|\bat\s+[\w$.]+\(|<html|org\.|java\.|com\./i;

export function friendlyMessage(status, data) {
  const candidate =
    typeof data === 'string' ? data : data && typeof data.message === 'string' ? data.message : '';
  const safe = candidate && candidate.length <= 160 && !UNSAFE.test(candidate);
  if (status >= 400 && status < 500 && status !== 401 && safe) return candidate;
  return BY_STATUS[status] || (status >= 500 ? BY_STATUS[500] : 'Something went wrong. Please try again.');
}
