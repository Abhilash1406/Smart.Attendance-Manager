import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { attendanceAPI } from '../../api/attendance';
import { ROUTES } from '../../utils/constants';
import { Camera, ClipboardList, CheckCircle, Clock, Wifi } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const map = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {loading
          ? <div className="h-7 w-12 bg-gray-100 rounded animate-pulse mt-1" />
          : <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user }                       = useAuth();
  const [history,     setHistory]      = useState([]);
  const [todayStatus, setTodayStatus]  = useState(null);
  const [loading,     setLoading]      = useState(true);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    (async () => {
      try {
        const [histRes, statusRes] = await Promise.all([
          attendanceAPI.getHistory(),
          attendanceAPI.getTodayStatus(),
        ]);
        setHistory(histRes.data);
        setTodayStatus(statusRes.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const approved = history.filter(r => r.status === 'APPROVED').length;
  const pending  = history.filter(r => r.status === 'PENDING').length;
  const pct      = history.length > 0 ? Math.round((approved / history.length) * 100) : 0;
  const recent   = [...history].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">{today}</p>
        </div>
        <Link to={ROUTES.MARK_ATTENDANCE}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Camera className="h-4 w-4" /> Mark Attendance
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Sessions" value={history.length} icon={ClipboardList} color="bg-primary-500" loading={loading} />
        <StatCard title="Approved"       value={approved}       icon={CheckCircle}   color="bg-green-500"   loading={loading} />
        <StatCard title="Pending"        value={pending}        icon={Clock}         color="bg-yellow-500"  loading={loading} />
        <StatCard title="Attendance %"   value={`${pct}%`}      icon={CheckCircle}   color="bg-blue-500"    loading={loading} />
      </div>

      {!loading && todayStatus && (
        <div className={`rounded-xl p-4 flex items-start gap-3 border ${
          todayStatus.submittedToday ? 'bg-green-50 border-green-100'
            : todayStatus.withinWindow ? 'bg-blue-50 border-blue-100'
            : 'bg-amber-50 border-amber-100'}`}>
          {todayStatus.submittedToday ? (
            <><CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-green-900 font-medium text-sm">Attendance Submitted Today</p>
                <p className="text-green-700 text-sm mt-0.5">Your request is pending admin verification.</p></div></>
          ) : todayStatus.withinWindow ? (
            <><Wifi className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-blue-900 font-medium text-sm">Attendance Window is Open!</p>
                <p className="text-blue-700 text-sm mt-0.5">Mark your attendance now before the window closes.</p></div></>
          ) : (
            <><Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div><p className="text-amber-900 font-medium text-sm">Attendance Window is Closed</p>
                <p className="text-amber-700 text-sm mt-0.5">Next window: 9:00 AM – 9:15 AM tomorrow.</p></div></>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Attendance</h2>
          <Link to={ROUTES.ATTENDANCE_HISTORY} className="text-primary-600 text-sm hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : recent.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No attendance records yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map(r => (
              <div key={r.id} className="px-5 py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {r.submissionDate ? format(new Date(r.submissionDate), 'EEEE, dd MMM yyyy') : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Submitted at {r.submittedAt ? format(new Date(r.submittedAt), 'hh:mm a') : '—'}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
