import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { GraduationCap, Shield, Clock, Wifi } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Local Camera icon — defined BEFORE features array to avoid TDZ ReferenceError
const Camera = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const features = [
  { icon: Shield,       label: 'Secure Google Auth',        desc: 'College email required'   },
  { icon: Camera,       label: 'Live Photo Capture',        desc: 'Webcam-based attendance'  },
  { icon: Clock,        label: 'Time-Windowed Marking',     desc: 'Configurable time slots'  },
  { icon: Wifi,         label: 'Network Restricted',        desc: 'College WiFi only'        },
];

const Login = () => {
  const { isAuthenticated, user, loading, handleGoogleSuccess, handleGoogleError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const destination = user?.role === 'ADMIN'
        ? ROUTES.ADMIN_DASHBOARD
        : ROUTES.STUDENT_DASHBOARD;
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
        <LoadingSpinner size="xl" color="white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left: Branding */}
        <div className="text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight">T&P Smart Attendance</h1>
                <p className="text-primary-300 text-sm">Training & Placement Department</p>
              </div>
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              A secure, automated attendance management system for college Training & Placement sessions.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-start gap-3 bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10">
                <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <feature.icon className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{feature.label}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Login card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto">
              <GraduationCap className="h-8 w-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-500 text-sm">
              Use your college Google account to access the system
            </p>
          </div>

          {/* Notice */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <p className="text-primary-800 text-sm font-medium mb-1">
              🔒 Authorised accounts only
            </p>
            <p className="text-primary-600 text-xs">
              Sign in with your{' '}
              <code className="bg-primary-100 px-1 rounded">@kitsw.ac.in</code>{' '}
              college account <span className="font-medium">or</span>{' '}
              <code className="bg-primary-100 px-1 rounded">@gmail.com</code>{' '}
              personal account. Other email domains will be rejected.
            </p>
          </div>

          {/* Google Sign-In Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleSuccess(credentialResponse.credential);
              }}
              onError={handleGoogleError}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="320"
            />
          </div>

          <p className="text-center text-xs text-gray-400">
            By signing in, you agree to the T&P department's attendance policy.
            Photos captured for attendance will be deleted after 7 days.
          </p>

          {/* Network warning */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
            <Wifi className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-700 text-xs">
              <span className="font-medium">Network required:</span> Attendance marking is only available from the college WiFi network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
