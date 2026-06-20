const TOKEN_KEY = 'archura_blog_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  if (res.status === 204) return undefined as T;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || data.error || 'Request failed');
  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: import('./types').User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<import('./types').User>('/auth/me'),
  users: {
    list: () => request<import('./types').User[]>('/auth/users'),
    create: (body: object) =>
      request<import('./types').User>('/auth/users', { method: 'POST', body: JSON.stringify(body) }),
    remove: (id: string) => request<void>(`/auth/users/${id}`, { method: 'DELETE' }),
  },
  dashboard: () => request<import('./types').DashboardData>('/api/dashboard'),
  authors: {
    list: () => request<import('./types').Author[]>('/api/authors'),
    create: (body: object) =>
      request<import('./types').Author>('/api/authors', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) =>
      request<import('./types').Author>(`/api/authors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    remove: (id: string) => request<void>(`/api/authors/${id}`, { method: 'DELETE' }),
  },
  categories: {
    list: () => request<import('./types').Category[]>('/api/categories'),
    create: (body: object) =>
      request<import('./types').Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: object) =>
      request<import('./types').Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    remove: (id: string) => request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
  },
  posts: {
    list: (params?: Record<string, string>) => {
      const qs = params ? `?${new URLSearchParams(params)}` : '';
      return request<import('./types').Post[]>(`/api/posts${qs}`);
    },
    create: (body: object) =>
      request<import('./types').Post>('/api/posts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: object) =>
      request<import('./types').Post>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
    remove: (id: string) => request<void>(`/api/posts/${id}`, { method: 'DELETE' }),
  },
  media: {
    list: (type?: string) => {
      const qs = type ? `?type=${type}` : '';
      return request<import('./types').Media[]>(`/api/media${qs}`);
    },
    upload: (file: File, alt?: string) => {
      const form = new FormData();
      form.append('file', file);
      if (alt) form.append('alt', alt);
      return request<import('./types').Media>('/api/media', { method: 'POST', body: form });
    },
    remove: (id: string) => request<void>(`/api/media/${id}`, { method: 'DELETE' }),
  },
};
