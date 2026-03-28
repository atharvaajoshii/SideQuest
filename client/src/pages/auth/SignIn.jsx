import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.email || !formData.password) {
    setError('Please fill all fields');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email.trim(),
        password: formData.password
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (response.ok) {
      localStorage.setItem('token', `Bearer ${data.token}`);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } else {
      setError(data.message || 'Invalid email or password');
    }

  } catch (err) {
    setError('Could not connect to the server. Is it running?');
  }

  setLoading(false);
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Welcome back to <span className="text-primary">SideQuest</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-indigo-500">
              Sign up for free
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="student@college.edu"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="••••••••"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}