import { request } from './client.js';

export const registerUser = (details) => request('/auth/register', { method: 'POST', body: details });
export const loginUser = (credentials) => request('/auth/login', { method: 'POST', body: credentials });
export const logoutUser = () => request('/auth/logout', { method: 'POST' });
export const fetchCurrentUser = () => request('/auth/me');
