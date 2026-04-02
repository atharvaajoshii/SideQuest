import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Shield, Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react';
import AuthHeader from '../../components/AuthHeader';
import AuthFooter from '../../components/AuthFooter';

export default function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, API } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Block signups if disabled by admin
  if (!settings.allow_signups) {
    return (
      <>
        <AuthHeader />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Signups Disabled</h1>
            <p className="text-slate-500 mb-4">
              Registration is currently disabled. Please contact support for more information.
            </p>
            <Link
              to="/signin"
              className="inline-block px-6 py-3 bg-[#FFD93D] text-[#1A1A2E] font-bold rounded-xl hover:bg-[#e6c235] transition"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
        <AuthFooter />
      </>
    );
  }

  // Password requirements
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasLower: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-200';
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        navigate('/home');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Could not connect to the server. Please check your connection.');
    }

    setLoading(false);
  };

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1A1A2E] px-8 py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[#FFD93D]/20 rounded-xl">
                  <Shield size={36} className="text-[#FFD93D]" />
                </div>
              </div>
              <h2
                className="text-2xl font-bold text-white mb-1"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Join SideQuest
              </h2>
              <p className="text-white/60 text-sm">
                Create your account and start earning
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-8">
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={20} />
                    </div>
                    <input
                      type="text"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D]/50 focus:border-[#FFD93D] transition-all text-sm bg-slate-50 hover:bg-white"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    College Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      required
                      className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D]/50 focus:border-[#FFD93D] transition-all text-sm bg-slate-50 hover:bg-white"
                      placeholder="student@college.edu"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock size={20} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      className="w-full pl-12 pr-12 py-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFD93D]/50 focus:border-[#FFD93D] transition-all text-sm bg-slate-50 hover:bg-white"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>

                  {/* Strength */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-2">
                        <span>Password strength</span>
                        <span>
                          {passwordStrength <= 2
                            ? 'Weak'
                            : passwordStrength === 3
                            ? 'Good'
                            : 'Strong'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full">
                        <div
                          className={`${getStrengthColor()} h-full`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#FFD93D] text-[#1A1A2E] font-bold rounded-xl"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <div className="text-center mt-6">
                <Link to="/signin">Already have an account? Sign In</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
}