// utils/api.js
export const apiFetch = async (url, options = {}, logout) => {
  try {
    const res = await fetch(url, options);

    if (res.status === 401 || res.status === 403) {
      logout?.();
      throw new Error('Unauthorized');
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
};