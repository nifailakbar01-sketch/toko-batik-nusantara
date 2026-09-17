const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const options = {
    method,
    credentials: 'include',
    headers: {}
  };

  if (body !== undefined) {
    if (isForm) {
      options.body = body; // FormData — jangan set Content-Type manual
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${path}`, options);

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || 'Terjadi kesalahan.');
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
};

/** URL aset statis di backend, mis. '/img/qris.png' */
export function urlAset(pathAset) {
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}${pathAset.startsWith('/') ? '' : '/'}${pathAset}`;
}

export function urlGambar(nama) {
  const base = API_URL.replace(/\/api\/?$/, '');
  return `${base}/uploads/${nama}`;
}
