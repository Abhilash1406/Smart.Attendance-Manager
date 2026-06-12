export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const TOKEN_KEY    = 'tp_jwt_token';
export const USER_KEY     = 'tp_user';

export const ROLES = {
  STUDENT: 'STUDENT',
  ADMIN:   'ADMIN',
};

export const ATTENDANCE_STATUS = {
  PENDING:  'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const STATUS_COLORS = {
  PENDING:  { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-400' },
  APPROVED: { bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-400'  },
  REJECTED: { bg: 'bg-red-100',    text: 'text-red-800',    dot: 'bg-red-400'    },
};

export const ROUTES = {
  LOGIN:             '/',
  STUDENT_DASHBOARD: '/student/dashboard',
  MARK_ATTENDANCE:   '/student/mark-attendance',
  ATTENDANCE_HISTORY:'/student/history',
  ADMIN_DASHBOARD:   '/admin/dashboard',
  ADMIN_PENDING:     '/admin/pending',
  ADMIN_REPORTS:     '/admin/reports',
};
