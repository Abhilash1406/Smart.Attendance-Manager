import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attendanceAPI } from '../../api/attendance';
import { ROUTES, STATUS_COLORS } from '../../utils/constants';
import { ClipboardList, Camera, CheckCircle, XCircle, Clock, Image } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const icons  = { PENDING: Clock, APPROVED: CheckCircle, REJECTED: XCircle };
  const Icon   = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
};

const AttendanceHistory = () => {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await attendanceAPI.getHistory();
        setRecords(res.data);
      } catch {
        setError('Failed to load attendance history.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const approved = records.filter(r => r.status === 'APPROVED').length;
  const pending  = records.filter(r => r.status === 'PENDING').length;
  const rejected = records.filter(r => r.status === 'REJECTED').length;
  const pct      = records.length > 0 ? Math.round((approved / records.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance History</h1>
          <p className="text-gray-500 text-sm mt-1">Your complete T&P session attendance record</p>
        </div>
        <Link to={ROUTES.MARK_ATTENDANCE} className="btn-primary flex items-center gap-2">
          <Camera className="h-4 w-4" /> Mark Today
        </Link>
      </div>

      {/* Summary cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',    value: records.length, color: 'text-gray-900',   bg: 'bg-gray-50'    },
            { label: 'Approved', value: approved,       color: 'text-green-700',  bg: 'bg-green-50'   },
            { label: 'Pending',  value: pending,        color: 'text-yellow-700', bg: 'bg-yellow-50'  },
            { label: 'Rate',     value: `${pct}%`,      color: 'text-primary-700',bg: 'bg-primary-50' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.bg} border border-gray-100`}>
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Records</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">
            <XCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ClipboardList className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No attendance records yet</p>
            <p className="text-xs mt-1">Mark your first attendance to see history here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Submitted At</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Photo</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {r.submissionDate ? format(new Date(r.submissionDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {r.submittedAt ? format(new Date(r.submittedAt), 'hh:mm a') : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-5 py-4">
                      {r.imageUrl ? (
                        <a href={r.imageUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs">
                          <Image className="h-3.5 w-3.5" /> View
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">Deleted</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceHistory;
