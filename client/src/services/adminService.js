// services/adminService.js
import { apiFetch } from '../utils/api';

export const getAdminStats = (API, token, logout) =>
  apiFetch(`${API}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  }, logout);

export const getUsers = (API, token, logout, query = '') =>
  apiFetch(`${API}/api/admin/users${query}`, {
    headers: { Authorization: `Bearer ${token}` }
  }, logout);

export const toggleUser = (API, token, logout, userId, is_suspended) =>
  apiFetch(`${API}/api/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ is_suspended })
  }, logout);

export const deleteUser = (API, token, logout, userId) =>
  apiFetch(`${API}/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  }, logout);