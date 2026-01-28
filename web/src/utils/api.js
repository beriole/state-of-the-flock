import axios from 'axios';

// Base URL configuration (Render support)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Utility function to handle photo URLs
export const getPhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    // Vite proxy expects leading slash for /uploads
    return url.startsWith('/') ? url : `/${url}`;
};

// Créer une instance axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: function (status) {
        return status >= 200 && status < 300;
    },
});

// Intercepteur pour ajouter le token automatiquement
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('token');
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
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirection vers login gérée par le contexte ou le router
            window.location.href = '/login';
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
    uploadPhoto: (id, formData) => api.post(`/members/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
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
    getUsers: (params = {}) => api.get('/users', { params }),
    getBacentaLeaders: (params = {}) => api.get('/users', { params: { ...params, role: 'Bacenta_Leader' } }),
    createBacentaLeader: (data) => api.post('/users', { ...data, role: 'Bacenta_Leader' }),
    updateBacentaLeader: (id, data) => api.put(`/users/${id}`, data),
    deleteBacentaLeader: (id) => api.delete(`/users/${id}`),
    createUser: (data) => api.post('/users', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    uploadUserPhoto: (id, formData) => api.post(`/users/${id}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    getGlobalStats: (params = {}) => api.get('/dashboard', { params }),
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

export const areaAPI = {
    getAreas: (params = {}) => api.get('/areas', { params }),
    getAreaById: (id) => api.get(`/areas/${id}`),
    createArea: (data) => api.post('/areas', data),
    updateArea: (id, data) => api.put(`/areas/${id}`, data),
    deleteArea: (id) => api.delete(`/areas/${id}`),
    assignAreaToUser: (data) => api.post('/areas/assign', data),
    getAreaLeaders: (id) => api.get(`/areas/${id}/leaders`),
};

export const dashboardAPI = {
    getGlobalStats: (params = {}) => api.get('/dashboard', { params }),
    getAreaStats: (areaId) => api.get(`/dashboard/area/${areaId}/stats`),
    getLeaderStats: (leaderId) => api.get(`/dashboard/leader/${leaderId}/stats`),
    getFinancialStats: (params = {}) => api.get('/dashboard/financials', { params }),
    getPerformanceRankings: (params = {}) => api.get('/dashboard/rankings', { params }),
};

// Fonctions API pour les Ministères
export const ministryAPI = {
    getAllMinistries: () => api.get('/ministries'),
    createMinistry: (data) => api.post('/ministries', data),
    deleteMinistry: (id) => api.delete(`/ministries/${id}`),
    getMinistryMembers: (id) => api.get(`/ministries/${id}/members`),
    markAttendance: (id, data) => api.post(`/ministries/${id}/attendance`, data),
    getAttendanceStats: (id, params) => api.get(`/ministries/${id}/attendance/stats`, { params }),
    getMinistryStats: (id, params) => api.get(`/ministries/${id}/attendance/stats`, { params }),
    getAttendanceOverview: (date) => api.get('/ministries/overview', { params: { date } }),
    saveHeadcounts: (data) => api.post('/ministries/headcounts', data),
    getMinistryEvolution: (id, startDate, endDate) => api.get(`/ministries/${id}/evolution?start_date=${startDate}&end_date=${endDate}`)
};

// Fonctions API pour les Régions
export const regionAPI = {
    getRegions: () => api.get('/regions'),
    createRegion: (data) => api.post('/regions', data),
    updateRegion: (id, data) => api.put(`/regions/${id}`, data),
    deleteRegion: (id) => api.delete(`/regions/${id}`),
};

export default api;
