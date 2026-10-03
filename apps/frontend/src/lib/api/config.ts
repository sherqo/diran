/**
 * Single source of truth for the backend base URL.
 *
 * `NEXT_PUBLIC_API_URL` must include the `/v1` suffix, e.g.
 * `NEXT_PUBLIC_API_URL=http://localhost:3000/v1` (local) or
 * `https://diran-backend.vercel.app/v1` (prod).
 */
function normalizeBaseUrl(raw: string): string {
    return raw.replace(/\/+$/, '');
}

export const API_BASE_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1');

export function apiUrl(path: string): string {
    const suffix = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${suffix}`;
}
