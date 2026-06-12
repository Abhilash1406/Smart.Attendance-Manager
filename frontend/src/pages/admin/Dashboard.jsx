import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/attendance';
import { ROUTES } from '../../utils/constants';
import { Users, CheckSquare, XCircle, Clock, FileBarChart, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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

const AdminDashboard = () => {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminAPI.getDailyStats();
        setStats(res.data);
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students"  value={stats?.totalStudents   ?? '—'} icon={Users}       color="bg-primary-500" loading={loading} />
        <StatCard title="Pending Review"  value={stats?.pending         ?? '—'} icon={Clock}       color="bg-yellow-500"  loading={loading} />
        <StatCard title="Approved Today"  value={stats?.approved        ?? '—'} icon={CheckSquare} color="bg-green-500"   loading={loading} />
        <StatCard title="Rejected Today"  value={stats?.rejected        ?? '—'} icon={XCircle}     color="bg-red-500"     loading={loading} />
      </div>

      {!loading && stats && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Today's Attendance Rate</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-700"
                style={{ width: `${stats.attendancePercentage || 0}%` }}
              />
            </div>
            <span className="text-lg font-bold text-primary-700 min-w-[3rem] text-right">
              {stats.attendancePercentage?.toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {stats.approved} of {stats.totalStudents} students marked present
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to={ROUTES.ADMIN_PENDING}
          className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:bg-yellow-100 transition-colors">
            <CheckSquare className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Review Pending Requests</p>
            <p className="text-sm text-gray-500">
              {loading ? '…' : `${stats?.pending ?? 0} request(s) awaiting review`}
            </p>
          </div>
        </Link>

        <Link to={ROUTES.ADMIN_REPORTS}
          className="flex items-center gap-4 bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <FileBarChart className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Attendance Reports</p>
            <p className="text-sm text-gray-500">View and export date-range reports</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
