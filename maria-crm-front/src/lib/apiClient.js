export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok || (payload && payload.success === false)) {
    const message = payload?.error?.message || `HTTP ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.error?.details;
    throw error;
  }

  return payload?.data ?? null;
}

export const apiClient = {
  get: (path, options) => request(path, { method: 'GET', ...options }),
  post: (path, body, options) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
      headers: body instanceof FormData ? {} : undefined,
      ...options,
    }),
  patch: (path, body, options) =>
    request(path, {
      method: 'PATCH',
      body: JSON.stringify(body || {}),
      ...options,
    }),
};
