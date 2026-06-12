import api from './axios';

export const attendanceAPI = {
  // Student: mark attendance with photo
  markAttendance: (photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    return api.post('/attendance/mark', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Student: get own history
  getHistory: () => api.get('/attendance/history'),

  // Student: today status
  getTodayStatus: () => api.get('/attendance/status/today'),
};

export const adminAPI = {
  // Admin: pending requests
  getPending: () => api.get('/admin/pending'),

  // Admin: all requests
  getAllRequests: () => api.get('/admin/requests'),

  // Admin: approve
  approve: (id, remarks = '') => api.post(`/admin/approve/${id}`, { remarks }),

  // Admin: reject
  reject: (id, remarks = '') => api.post(`/admin/reject/${id}`, { remarks }),

  // Admin: daily stats
  getDailyStats: (date) => {
    const params = date ? { date } : {};
    return api.get('/admin/stats/daily', { params });
  },

  // Admin: date range report
  getReport: (from, to) => api.get('/admin/reports', { params: { from, to } }),

  // Admin: students list
  getStudents: () => api.get('/admin/students'),
};
