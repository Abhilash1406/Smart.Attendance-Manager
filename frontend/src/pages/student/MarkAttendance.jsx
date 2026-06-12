import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useNavigate } from 'react-router-dom';
import { attendanceAPI } from '../../api/attendance';
import { ROUTES } from '../../utils/constants';
import { Camera, RefreshCw, CheckCircle, XCircle, Wifi, Clock, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WEBCAM_CONSTRAINTS = {
  width: 640,
  height: 480,
  facingMode: 'user',
};

const MarkAttendance = () => {
  const webcamRef                       = useRef(null);
  const navigate                        = useNavigate();

  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedBlob,  setCapturedBlob]  = useState(null);
  const [cameraReady,   setCameraReady]   = useState(false);
  const [cameraError,   setCameraError]   = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState(false);
  const [todayStatus,   setTodayStatus]   = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);

  // Check today's status on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await attendanceAPI.getTodayStatus();
        setTodayStatus(res.data);
      } catch {
        // non-blocking
      } finally {
        setStatusLoading(false);
      }
    })();
  }, []);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    // Convert base64 to Blob for upload
    fetch(imageSrc)
      .then(r => r.blob())
      .then(blob => {
        setCapturedImage(imageSrc);
        setCapturedBlob(blob);
      });
  }, []);

  const retake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
  };

  const submit = async () => {
    if (!capturedBlob) return;
    setSubmitting(true);
    try {
      const file = new File([capturedBlob], 'attendance.jpg', { type: 'image/jpeg' });
      await attendanceAPI.markAttendance(file);
      setSubmitted(true);
      toast.success('Attendance submitted! Awaiting admin verification.');
      setTimeout(() => navigate(ROUTES.ATTENDANCE_HISTORY), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Status loading ---
  if (statusLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // --- Already submitted today ---
  if (todayStatus?.submittedToday || submitted) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Already Submitted</h2>
          <p className="text-gray-500 text-sm">
            You've already submitted your attendance request for today.
            Check your history to see the status.
          </p>
          <button
            onClick={() => navigate(ROUTES.ATTENDANCE_HISTORY)}
            className="mt-6 btn-primary w-full"
          >
            View My History
          </button>
        </div>
      </div>
    );
  }

  // --- Outside attendance window ---
  if (todayStatus && !todayStatus.withinWindow) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Outside Attendance Window</h2>
          <p className="text-gray-500 text-sm">
            Attendance marking is only available between{' '}
            <span className="font-semibold text-gray-700">9:00 AM – 9:15 AM</span>.
            Please come back during the window.
          </p>
          <button
            onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
            className="mt-6 btn-secondary w-full"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">
          Capture a clear photo of your face to submit your attendance request.
        </p>
      </div>

      {/* Network & window notice */}
      <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
        <Wifi className="h-4 w-4 text-blue-600 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          <span className="font-medium">College WiFi required.</span>{' '}
          Ensure you are connected to the campus network before submitting.
        </p>
      </div>

      {/* Camera card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Camera className="h-5 w-5 text-primary-600" />
          <h2 className="font-semibold text-gray-900">Live Camera</h2>
          {cameraReady && !capturedImage && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Camera active
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Camera / Preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
            {cameraError ? (
              <div className="text-center text-white space-y-2 p-6">
                <XCircle className="h-10 w-10 text-red-400 mx-auto" />
                <p className="text-sm font-medium">Camera access denied</p>
                <p className="text-xs text-gray-400">{cameraError}</p>
              </div>
            ) : capturedImage ? (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.92}
                videoConstraints={WEBCAM_CONSTRAINTS}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={(e) => setCameraError(e.message || 'Could not access camera')}
                className="w-full h-full object-cover"
                mirrored
              />
            )}

            {/* Overlay guide when live */}
            {!capturedImage && cameraReady && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-56 border-2 border-white/40 rounded-full" />
              </div>
            )}

            {/* Captured badge */}
            {capturedImage && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3" />
                Photo captured
              </div>
            )}
          </div>

          {/* Instructions */}
          {!capturedImage && cameraReady && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-600 mb-2">Tips for a good photo:</p>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>Face the camera directly in good lighting</li>
                <li>Remove glasses or masks if possible</li>
                <li>Keep your face within the oval guide</li>
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <button
                onClick={capture}
                disabled={!cameraReady || !!cameraError}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
              >
                <Camera className="h-4 w-4" />
                {cameraReady ? 'Capture Photo' : 'Waiting for camera…'}
              </button>
            ) : (
              <>
                <button
                  onClick={retake}
                  disabled={submitting}
                  className="flex items-center gap-2 btn-secondary px-5 py-3"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retake
                </button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium px-6 py-3 rounded-xl transition-colors text-sm"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Submit Attendance
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Privacy note */}
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Your photo is used only for attendance verification and auto-deleted after 7 days.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
