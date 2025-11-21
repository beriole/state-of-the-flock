import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL du backend
const BASE_URL = 'http://10.5.50.123:5000/api'; // IP de votre PC pour l'émulateur

// Créer une instance axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // TODO: Rediriger vers login
    }
    return Promise.reject(error);
  }
);

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

export default api;