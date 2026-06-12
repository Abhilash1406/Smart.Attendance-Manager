import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../api/attendance';
import { FileBarChart, Download, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const map = { PENDING: 'badge-pending', APPROVED: 'badge-approved', REJECTED: 'badge-rejected' };
  return <span className={map[status] || 'badge-pending'}>{status}</span>;
};

const Reports = () => {
  const [from,     setFrom]     = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [to,       setTo]       = useState(format(endOfMonth(new Date()),   'yyyy-MM-dd'));
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);
  const [search,   setSearch]   = useState('');

  const fetchReport = async () => {
    if (!from || !to) { toast.error('Please select both dates'); return; }
    if (from > to)    { toast.error('From date must be before To date'); return; }
    setLoading(true);
    try {
      const res = await adminAPI.getReport(from, to);
      setRecords(res.data);
      setSearched(true);
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  // Auto-load current month on mount
  useEffect(() => { fetchReport(); }, []);

  const filtered = records.filter(r =>
    !search ||
    r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    r.studentEmail?.toLowerCase().includes(search.toLowerCase())
  );

  const approved = filtered.filter(r => r.status === 'APPROVED').length;
  const rejected = filtered.filter(r => r.status === 'REJECTED').length;
  const pending  = filtered.filter(r => r.status === 'PENDING').length;

  const exportCSV = () => {
    const rows = [
      ['Student Name', 'Email', 'Department', 'Date', 'Status', 'Submitted At', 'Remarks'],
      ...filtered.map(r => [
        r.studentName, r.studentEmail, r.studentDepartment || '',
        r.submissionDate || '',
        r.status,
        r.submittedAt ? format(new Date(r.submittedAt), 'dd MMM yyyy hh:mm a') : '',
        r.remarks || '',
      ])
    ];
    const csv  = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `attendance_report_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Filter and export attendance data</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">From Date</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">To Date</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <button onClick={fetchReport} disabled={loading}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors">
            {loading ? <LoadingSpinner size="sm" color="white" /> : <FileBarChart className="h-4 w-4" />}
            Generate Report
          </button>
          {searched && filtered.length > 0 && (
            <button onClick={exportCSV}
              className="flex items-center gap-2 btn-secondary px-5 py-2 ml-auto">
              <Download className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      {searched && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',    value: filtered.length, color: 'bg-primary-50 text-primary-700' },
            { label: 'Approved', value: approved,        color: 'bg-green-50 text-green-700'    },
            { label: 'Pending',  value: pending,         color: 'bg-yellow-50 text-yellow-700'  },
            { label: 'Rejected', value: rejected,        color: 'bg-red-50 text-red-700'        },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color} border border-gray-100`}>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search within results */}
      {searched && records.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}

      {/* Results table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            Results {searched && `(${filtered.length})`}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : !searched ? (
          <div className="text-center py-16 text-gray-400">
            <FileBarChart className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Select a date range and click Generate Report.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No records found for the selected range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {['Student', 'Date', 'Submitted At', 'Status', 'Remarks'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{r.studentName}</p>
                      <p className="text-xs text-gray-400">{r.studentEmail}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {r.submissionDate ? format(new Date(r.submissionDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {r.submittedAt ? format(new Date(r.submittedAt), 'hh:mm a') : '—'}
                    </td>
                    <td className="px-5 py-3.5"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-xs truncate">{r.remarks || '—'}</td>
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

export default Reports;
