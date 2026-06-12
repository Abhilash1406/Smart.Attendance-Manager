import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../api/attendance';
import { CheckCircle, XCircle, Clock, Image, X, RefreshCw, User } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PhotoModal = ({ url, name, onClose }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-white rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900">{name}'s Photo</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4">
        <img src={url} alt={name} className="w-full rounded-xl object-cover max-h-96" />
      </div>
    </div>
  </div>
);

const RemarksModal = ({ action, onConfirm, onClose }) => {
  const [remarks, setRemarks] = useState('');
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            {action === 'approve' ? '✅ Approve Attendance' : '❌ Reject Attendance'}
          </h3>
        </div>
        <div className="px-6 py-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Remarks <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            placeholder={action === 'approve' ? 'e.g. Verified via photo' : 'e.g. Photo unclear, student absent'}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary px-5 py-2">Cancel</button>
          <button
            onClick={() => onConfirm(remarks)}
            className={`px-5 py-2 rounded-xl text-sm font-medium text-white transition-colors ${
              action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            Confirm {action === 'approve' ? 'Approval' : 'Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingRequests = () => {
  const [requests,  setRequests]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [photoModal,setPhotoModal]= useState(null);   // { url, name }
  const [actionModal,setActionModal] = useState(null); // { id, action, name }
  const [processing, setProcessing] = useState({});

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getPending();
      setRequests(res.data);
    } catch {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  const handleAction = async (remarks) => {
    if (!actionModal) return;
    const { id, action } = actionModal;
    setProcessing(p => ({ ...p, [id]: true }));
    setActionModal(null);
    try {
      if (action === 'approve') {
        await adminAPI.approve(id, remarks);
        toast.success('Attendance approved successfully');
      } else {
        await adminAPI.reject(id, remarks);
        toast.success('Attendance rejected');
      }
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(p => ({ ...p, [id]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? '…' : `${requests.length} request(s) awaiting your review`}
          </p>
        </div>
        <button onClick={fetchPending} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <p className="text-gray-700 font-semibold">All caught up!</p>
          <p className="text-gray-400 text-sm mt-1">No pending attendance requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Avatar */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {req.profilePicture ? (
                    <img src={req.profilePicture} alt={req.studentName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-primary-100 flex-shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary-500" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{req.studentName}</p>
                    <p className="text-sm text-gray-500 truncate">{req.studentEmail}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {req.submittedAt ? format(new Date(req.submittedAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Photo button */}
                <div className="flex items-center gap-3">
                  {req.imageUrl ? (
                    <button
                      onClick={() => setPhotoModal({ url: req.imageUrl, name: req.studentName })}
                      className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-xl transition-colors"
                    >
                      <Image className="h-4 w-4" /> View Photo
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 bg-gray-50 px-3 py-2 rounded-xl">No photo</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {processing[req.id] ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <button
                        onClick={() => setActionModal({ id: req.id, action: 'reject', name: req.studentName })}
                        className="flex items-center gap-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Reject
                      </button>
                      <button
                        onClick={() => setActionModal({ id: req.id, action: 'approve', name: req.studentName })}
                        className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> Approve
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* IP info footer */}
              {req.submittedFromIp && (
                <div className="px-5 py-2 bg-gray-50 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Submitted from IP: <span className="font-mono">{req.submittedFromIp}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {photoModal  && <PhotoModal   url={photoModal.url}            name={photoModal.name}            onClose={() => setPhotoModal(null)}   />}
      {actionModal && <RemarksModal action={actionModal.action}     onConfirm={handleAction}           onClose={() => setActionModal(null)}  />}
    </div>
  );
};

export default PendingRequests;
