import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Mail, Lock, CheckCircle, ArrowLeft, Key } from 'lucide-react';
import AuthHeader from '../../components/AuthHeader';
import AuthFooter from '../../components/AuthFooter';

export default function ForgotPassword() {
  const { API } = useAuth();
  const navigate = useNavigate();
  const { email } = useParams();

  // Request reset state
  const [requestEmail, setRequestEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: requestEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setRequestSuccess('If that email exists, a reset link has been sent');
        if (data.resetToken) {
          setResetToken(data.resetToken);
        }
      } else {
        setRequestError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setRequestError('Could not connect to the server');
    }

    setRequestLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }

    setResetLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/reset-password/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: resetToken,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => navigate('/signin'), 2000);
      } else {
        setResetError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setResetError('Could not connect to the server');
    }

    setResetLoading(false);
  };

  // If we have a token, show reset password form
  if (resetToken || resetSuccess) {
    return (
      <>
        <AuthHeader />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex flex-col">
          <div className="flex-grow flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-10 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <Lock size={40} className="text-white" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Reset Password
                  </h2>
                  <p className="text-emerald-100 text-sm">
                    Enter your new password below
                  </p>
                </div>

                <div className="px-8 py-8">
                  {resetSuccess ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        Password Reset Successfully!
                      </h3>
                      <p className="text-slate-500 text-sm mb-4">
                        Redirecting to sign in...
                      </p>
                      <button
                        onClick={() => navigate('/signin')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-900 to-indigo-900 text-white font-bold rounded-xl hover:from-slate-800 hover:to-indigo-800 transition-all"
                      >
                        <ArrowLeft size={18} />
                        Back to Sign In
                      </button>
                    </div>
                  ) : (
                    <>
                      {resetError && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-700 text-sm">{resetError}</span>
                        </div>
                      )}

                      <form onSubmit={handleResetPassword} className="space-y-5">
                        {/* Reset Token */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Reset Token
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Key size={20} />
                            </div>
                            <input
                              type="text"
                              required
                              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm font-mono bg-slate-50"
                              placeholder="Paste your reset token here"
                              value={resetToken}
                              onChange={(e) => setResetToken(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* New Password */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock size={20} />
                            </div>
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              required
                              className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm bg-slate-50"
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showNewPassword ? <Lock size={20} /> : <Lock size={20} />}
                            </button>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              <Lock size={20} />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm bg-slate-50"
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showConfirmPassword ? <Lock size={20} /> : <Lock size={20} />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={resetLoading}
                          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                        >
                          {resetLoading ? (
                            <>
                              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Resetting...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={20} />
                              Reset Password
                            </>
                          )}
                        </button>
                      </form>
                    </>
                  )}

                  <div className="mt-6 text-center">
                    <Link
                      to="/signin"
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-indigo-600 transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Back to Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <AuthFooter />
        </div>
      </>
    );
  }

  // Show request reset form
  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100 flex flex-col">
        <div className="flex-grow flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-10 text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                    <Mail size={40} className="text-white" />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-amber-100 text-sm">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </div>

              {/* Form */}
              <div className="px-8 py-8">
                {requestSuccess && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-green-800 text-sm">{requestSuccess}</p>
                        {resetToken && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                            <p className="text-xs text-slate-600 mb-1 font-medium">Reset Token (for development):</p>
                            <code className="text-xs font-mono text-slate-800 break-all bg-slate-100 px-2 py-1 rounded block">
                              {resetToken}
                            </code>
                            <Link
                              to={`/forgot-password/reset`}
                              className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-indigo-600"
                              onClick={() => sessionStorage.setItem('sq_reset_token', resetToken)}
                            >
                              Use this token to reset password →
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {requestError && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-700 text-sm">{requestError}</span>
                  </div>
                )}

                <form onSubmit={handleRequestReset} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm bg-slate-50 hover:bg-white"
                        placeholder="student@college.edu"
                        value={requestEmail}
                        onChange={(e) => setRequestEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={requestLoading}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                  >
                    {requestLoading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail size={20} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/signin"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-indigo-600 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Remember your password?{' '}
                <Link to="/signin" className="font-medium text-primary hover:text-indigo-600">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    </>
  );
}
