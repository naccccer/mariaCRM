export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const errorMessageMap = {
  'Invalid credentials': 'ایمیل یا رمز عبور اشتباه است.',
  Unauthenticated: 'نشست کاربری شما منقضی شده است. دوباره وارد شوید.',
  Forbidden: 'شما مجوز دسترسی به این بخش را ندارید.',
  'Internal server error': 'خطای داخلی سرور رخ داده است.',
  'Valid CSV file is required': 'فایل CSV معتبر الزامی است.',
  'Cannot open CSV file': 'خواندن فایل CSV ممکن نیست.',
  'Lead not found': 'سرنخ پیدا نشد.',
  'Contact not found': 'مشتری پیدا نشد.',
  'Deal not found': 'معامله پیدا نشد.',
  'Pipeline stages are not configured': 'مراحل قیف فروش تنظیم نشده است.',
};

function localizeErrorMessage(message, status) {
  if (message && errorMessageMap[message]) {
    return errorMessageMap[message];
  }

  if (!message && status === 401) {
    return 'احراز هویت ناموفق بود.';
  }

  if (!message && status === 403) {
    return 'شما به این بخش دسترسی ندارید.';
  }

  return message || `خطای سرور (${status})`;
}

function withQuery(path, query) {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    params.append(key, String(value));
  });

  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok || payload?.success === false) {
    const message = localizeErrorMessage(payload?.error?.message, response.status);
    const error = new Error(message);
    error.status = response.status;
    error.details = payload?.error?.details || null;
    throw error;
  }

  return payload?.data ?? null;
}

export const apiClient = {
  get: (path, query, options) => request(withQuery(path, query), { method: 'GET', ...options }),
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
