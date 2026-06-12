import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { ROUTES, ROLES } from './utils/constants';

import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import LoadingSpinner from './components/common/LoadingSpinner';

import Login from './pages/Login';
import StudentDashboard from './pages/student/Dashboard';
import MarkAttendance from './pages/student/MarkAttendance';
import AttendanceHistory from './pages/student/AttendanceHistory';
import AdminDashboard from './pages/admin/Dashboard';
import PendingRequests from './pages/admin/PendingRequests';
import Reports from './pages/admin/Reports';

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-50 font-sans">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-56 p-6 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  </div>
);

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/student/*" element={
          <ProtectedRoute requiredRole={ROLES.STUDENT}>
            <AppLayout>
              <Routes>
                <Route path="dashboard"       element={<StudentDashboard />} />
                <Route path="mark-attendance" element={<MarkAttendance />} />
                <Route path="history"         element={<AttendanceHistory />} />
                <Route path="*"               element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={
          <ProtectedRoute requiredRole={ROLES.ADMIN}>
            <AppLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="pending"   element={<PendingRequests />} />
                <Route path="reports"   element={<Reports />} />
                <Route path="*"         element={<Navigate to="dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { borderRadius: '12px', fontSize: '14px', fontFamily: 'Inter, sans-serif' },
        success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
      }} />
    </>
  );
};

export default App;
