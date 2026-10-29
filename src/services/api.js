import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tradesApi = {
  getTrades: (params) => api.get('/trades', { params }),
  getAllTrades: () => api.get('/trades/all'),
  getTradeById: (id) => api.get(`/trades/${id}`),
  createTrade: (data) => api.post('/trades', data),
  updateTrade: (id, data) => api.put(`/trades/${id}`, data),
  deleteTrade: (id) => api.delete(`/trades/${id}`),
  getInstruments: () => api.get('/trades/instruments'),
  getStrategies: () => api.get('/trades/strategies'),
  getExchanges: () => api.get('/trades/exchanges'),
  getExportCsvUrl: () => `${API_BASE_URL}/trades/export/csv`,
};

export const journalsApi = {
  getAllJournals: () => api.get('/journals'),
  getJournalByDate: (date) => api.get(`/journals/date/${date}`),
  saveJournal: (data) => api.post('/journals', data),
  updateJournal: (id, data) => api.put(`/journals/${id}`, data),
  deleteJournal: (id) => api.delete(`/journals/${id}`),
};

export const watchlistApi = {
  getWatchlist: (status) => api.get('/watchlist', { params: { status } }),
  getWatchlistItemById: (id) => api.get(`/watchlist/${id}`),
  createWatchlistItem: (data) => api.post('/watchlist', data),
  updateWatchlistItem: (id, data) => api.put(`/watchlist/${id}`, data),
  updateStatus: (id, status) => api.patch(`/watchlist/${id}/status`, { status }),
  deleteWatchlistItem: (id) => api.delete(`/watchlist/${id}`),
};

export const notesApi = {
  getNotes: (params) => api.get('/notes', { params }),
  getNoteById: (id) => api.get(`/notes/${id}`),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
};

export const dashboardApi = {
  getSummary: (params) => api.get('/dashboard/summary', { params }),
};

export const analyticsApi = {
  getAnalytics: (params) => api.get('/analytics', { params }),
};

export const settingsApi = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.post('/settings', data),
  getTransactions: () => api.get('/settings/transactions'),
  addTransaction: (data) => api.post('/settings/transactions', data),
  deleteTransaction: (id) => api.delete(`/settings/transactions/${id}`),
  resetAllData: () => api.post('/settings/reset-data'),
};

export default api;
