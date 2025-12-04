import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL du backend
// Production URL (Render deployment)
const BASE_URL = 'https://state-of-the-flock.onrender.com/api';
// const BASE_URL = 'http://10.0.2.2:5000/api'; // Pour émulateur Android (développement)
// const BASE_URL = 'http://192.168.137.2:5000/api'; // Pour téléphone réel sur même réseau (développement)
// const BASE_URL = 'http://localhost:5000/api'; // Pour iOS Simulator (développement)

// Créer une instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Augmenté à 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuration pour améliorer la compatibilité réseau
  validateStatus: function (status) {
    return status >= 200 && status < 300;
  },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.log('API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    });

    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // TODO: Rediriger vers login
    }

    // Gestion spécifique des erreurs réseau
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.warn('Network Error - Vérifiez votre connexion internet');
    }

    return Promise.reject(error);
  }
);

// Fonctions API pour l'authentification
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
};

// Fonctions API pour les membres
export const memberAPI = {
  getMembers: (params = {}) => api.get('/members', { params }),
  getMemberById: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),
};

// Fonctions API pour les présences
export const attendanceAPI = {
  getAttendance: (params = {}) => api.get('/attendance', { params }),
  bulkAttendance: (data) => api.post('/attendance/bulk', data),
  getAttendanceStats: (params = {}) => api.get('/attendance/stats/summary', { params }),
  generateCallList: (params = {}) => api.get('/attendance/call-list', { params }),
};

// Fonctions API pour Bacenta
export const bacentaAPI = {
  getMeetings: (params = {}) => api.get('/bacenta/meetings', { params }),
  createMeeting: (data) => api.post('/bacenta/meetings', data),
  getMeetingById: (id) => api.get(`/bacenta/meetings/${id}`),
  updateMeeting: (id, data) => api.put(`/bacenta/meetings/${id}`, data),
  deleteMeeting: (id) => api.delete(`/bacenta/meetings/${id}`),
  markAttendance: (meetingId, data) => api.post(`/bacenta/${meetingId}/attendance`, data),
  addOfferings: (meetingId, data) => api.post(`/bacenta/${meetingId}/offerings`, data),
  verifyMeeting: (id, data) => api.put(`/bacenta/meetings/${id}/verify`, data),
  getStats: (params = {}) => api.get('/bacenta/stats', { params }),
  getMembers: (params = {}) => api.get('/bacenta/members', { params }),
  uploadPhoto: (id, formData) => api.put(`/bacenta/meetings/${id}/photo`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

// Fonctions API pour les journaux d'appels
export const callLogAPI = {
  getCallLogs: (params = {}) => api.get('/call-logs', { params }),
  createCallLog: (data) => api.post('/call-logs', data),
  createArea: (data) => api.post('/areas', data),
  updateArea: (id, data) => api.put(`/areas/${id}`, data),
  deleteArea: (id) => api.delete(`/areas/${id}`),
  assignAreaToUser: (data) => api.post('/areas/assign', data),
};

// Fonctions API pour les Gouverneurs
export const governorAPI = {
  getBacentaLeaders: (params = {}) => api.get('/users', { params: { ...params, role: 'Bacenta_Leader' } }),
  createBacentaLeader: (data) => api.post('/users', { ...data, role: 'Bacenta_Leader' }),
  updateBacentaLeader: (id, data) => api.put(`/users/${id}`, data),
  deleteBacentaLeader: (id) => api.delete(`/users/${id}`),
  getGlobalStats: () => api.get('/dashboard'), // Dashboard adapts to user role
};

// Fonctions API pour les rapports
export const reportAPI = {
  getAttendanceReport: (params = {}) => api.get('/reports/attendance', { params }),
  getBacentaReport: (params = {}) => api.get('/reports/bacenta', { params }),
  getCallLogReport: (params = {}) => api.get('/reports/call-logs', { params }),
  getMemberGrowthReport: (params = {}) => api.get('/reports/member-growth', { params }),
  getGovernorAttendanceReport: (params = {}) => api.get('/reports/governor/attendance', { params }),
  exportData: (params = {}) => api.get('/reports/export', { params }),
};

export default api;