// src/lib/api.ts
const API = 'http://localhost:3001/api';

export const register = async (email: string, password: string, name: string) => {
  const res = await fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Register failed');
  return res.json();
};

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
  return res.json();
};

export const saveMessage = async (user_id: string, role: 'user' | 'assistant', content: string) => {
  await fetch(`${API}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, role, content })
  });
};

export const loadHistory = async (user_id: string) => {
  const res = await fetch(`${API}/messages/${user_id}`);
  return res.json();
};

export const updatePreferences = async (user_id: string, prefs: any) => {
  await fetch(`${API}/preferences/${user_id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id, ...prefs })
  });
};