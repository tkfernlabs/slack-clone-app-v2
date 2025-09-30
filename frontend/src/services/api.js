import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/users/me'),
  searchUsers: (query) => api.get(`/api/users/search?q=${query}`),
};

// Workspace APIs
export const workspaceAPI = {
  create: (data) => api.post('/api/workspaces', data),
  getAll: () => api.get('/api/workspaces'),
  getById: (id) => api.get(`/api/workspaces/${id}`),
  update: (id, data) => api.put(`/api/workspaces/${id}`, data),
  delete: (id) => api.delete(`/api/workspaces/${id}`),
  getMembers: (id) => api.get(`/api/workspaces/${id}/members`),
  inviteMember: (id, userId) => api.post(`/api/workspaces/${id}/members`, { userId }),
};

// Channel APIs
export const channelAPI = {
  create: (workspaceId, data) => api.post(`/api/workspaces/${workspaceId}/channels`, data),
  getAll: (workspaceId) => api.get(`/api/workspaces/${workspaceId}/channels`),
  getById: (channelId) => api.get(`/api/channels/${channelId}`),
  update: (channelId, data) => api.put(`/api/channels/${channelId}`, data),
  delete: (channelId) => api.delete(`/api/channels/${channelId}`),
  join: (channelId) => api.post(`/api/channels/${channelId}/join`),
  leave: (channelId) => api.post(`/api/channels/${channelId}/leave`),
  getMembers: (channelId) => api.get(`/api/channels/${channelId}/members`),
};

// Message APIs
export const messageAPI = {
  send: (channelId, data) => api.post(`/api/channels/${channelId}/messages`, data),
  getMessages: (channelId, page = 1, limit = 50) => 
    api.get(`/api/channels/${channelId}/messages?page=${page}&limit=${limit}`),
  update: (messageId, data) => api.put(`/api/messages/${messageId}`, data),
  delete: (messageId) => api.delete(`/api/messages/${messageId}`),
  addReaction: (messageId, emoji) => api.post(`/api/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (messageId, emoji) => api.delete(`/api/messages/${messageId}/reactions/${emoji}`),
  getThread: (messageId) => api.get(`/api/messages/${messageId}/thread`),
  reply: (messageId, data) => api.post(`/api/messages/${messageId}/replies`, data),
};

// Direct Message APIs
export const dmAPI = {
  send: (data) => api.post('/api/direct-messages', data),
  getConversations: () => api.get('/api/direct-messages/conversations'),
  getMessages: (userId, page = 1, limit = 50) => 
    api.get(`/api/direct-messages/user/${userId}?page=${page}&limit=${limit}`),
  update: (messageId, data) => api.put(`/api/direct-messages/${messageId}`, data),
  delete: (messageId) => api.delete(`/api/direct-messages/${messageId}`),
};

// Users API (for finding users to DM)
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (userId) => api.get(`/api/users/${userId}`),
  search: (query) => api.get(`/api/users/search?q=${query}`),
};

export default api;

