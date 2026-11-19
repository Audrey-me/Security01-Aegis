// Thin wrapper around the backend API. The session lives in an httpOnly
// cookie, which the browser sends automatically on same-origin requests.

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error ?? 'Something went wrong');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export interface User {
  id: number;
  email: string;
}

export interface Account {
  accountNumber: string;
  balanceCents: number;
  savingsCents: number;
  spendingCents: number;
}

export interface Transaction {
  id: number;
  merchant: string;
  category: string;
  amountCents: number;
  date: string;
}

export const api = {
  register: (data: { email: string; password: string; dob: string; gender: string }) =>
    request<User>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<User>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),
  me: () => request<User>('/api/me'),
  account: () => request<Account>('/api/account'),
  transactions: () => request<Transaction[]>('/api/transactions'),
};

export function formatCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
