import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function SignUp() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Used to redirect after successful signup

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  if (!formData.name || !formData.email || !formData.password) {
    setError('Please fill all fields');
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name.trim(),
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } else {
      setError(data.message || 'Something went wrong');
    }

  } catch (err) {
    setError('Could not connect to the server. Is it running?');
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
            Join <span className="text-primary">SideQuest</span>
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Start earning on campus today. Already a member?{' '}
            <Link to="/signin" className="font-medium text-primary hover:text-indigo-500">
              Log in
            </Link>
          </p>
        </div>
        
        {/* Display errors if there are any */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="John Doe"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">College Email address</label>
              <input
                type="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="student@college.edu"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Create a strong password"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-secondary hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition shadow-md"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}