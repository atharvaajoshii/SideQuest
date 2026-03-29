import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PostTask() {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Coding',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!taskData.title || !taskData.description || !taskData.price) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ✅ FIX: always add "Bearer " here — token stored raw
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          price: Number(taskData.price),
          category: taskData.category,
        }),
      });

      let data;
      try { data = await response.json(); } catch { data = {}; }

      if (response.ok) {
        // ✅ FIX: navigate to the new task instead of alert()
        navigate(`/tasks/${data.id}`);
      } else {
        setError(data.message || 'Failed to post task');
      }
    } catch (err) {
      setError('Server error. Is backend running?');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Post a SideQuest ✍️</h1>
          <p className="text-slate-500 mt-2">
            Need help with something? Offer a fair price and let a fellow student handle it.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm font-medium text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Quest Title</label>
            <input
              type="text"
              value={taskData.title}
              required
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition"
              placeholder="e.g. Need a logo for my startup"
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Details & Requirements</label>
            <textarea
              value={taskData.description}
              required
              rows="4"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition"
              placeholder="Explain exactly what you need done..."
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
              <select
                value={taskData.category}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary bg-white transition"
                onChange={(e) => setTaskData({ ...taskData, category: e.target.value })}
              >
                <option>Coding</option>
                <option>Design</option>
                <option>Writing</option>
                <option>Physical / Errands</option>
                <option>Tutoring</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reward (₹)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold">₹</div>
                <input
                  type="number"
                  value={taskData.price}
                  required
                  min="1"
                  className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition"
                  placeholder="500"
                  onChange={(e) => setTaskData({ ...taskData, price: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-slate-900 hover:bg-primary transition disabled:opacity-60"
            >
              {loading ? 'Posting...' : 'Post Quest to Marketplace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}