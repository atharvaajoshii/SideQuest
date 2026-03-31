import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TaskEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, API } = useAuth();

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    deadline: '',
    status: 'open',
    is_visible: true,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API}/api/tasks/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const task = await res.json();
          setTaskData({
            title: task.title || '',
            description: task.description || '',
            price: task.price || '',
            category: task.category || 'Design',
            deadline: task.deadline || '',
            status: task.status || 'open',
            is_visible: task.is_visible !== false,
          });
        } else if (response.status === 403) {
          setError('You do not have permission to edit this task. Only the owner can edit.');
        } else if (response.status === 404) {
          setError('Task not found');
        } else {
          setError('Failed to load task');
        }
      } catch (err) {
        setError('Server error. Is backend running?');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, token, API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!taskData.title || !taskData.description || !taskData.price) {
      setError('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      console.log('Updating task:', id, 'with data:', {
        title: taskData.title.trim(),
        description: taskData.description.trim(),
        price: Number(taskData.price),
        category: taskData.category,
        deadline: taskData.deadline || null,
        status: taskData.status,
        is_visible: taskData.is_visible,
      });

      const response = await fetch(`${API}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          price: Number(taskData.price),
          category: taskData.category,
          deadline: taskData.deadline || null,
          status: taskData.status,
          is_visible: taskData.is_visible,
        }),
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (response.ok) {
        alert('Task updated successfully!');
        navigate(`/tasks/${id}`);
      } else {
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Server error: ' + err.message);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading task...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Edit SideQuest ✏️</h1>
          <p className="text-slate-500 mt-2">
            Update your task details.
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
                <option value="Design">Design</option>
                <option value="Development">Development</option>
                <option value="Writing">Writing</option>
                <option value="Video">Video</option>
                <option value="Tutoring">Tutoring</option>
                <option value="Other">Other</option>
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

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Deadline (Optional)</label>
            <input
              type="text"
              value={taskData.deadline}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition"
              placeholder="e.g. 2 weeks, March 31st, ASAP"
              onChange={(e) => setTaskData({ ...taskData, deadline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
            <select
              value={taskData.status}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary bg-white transition"
              onChange={(e) => setTaskData({ ...taskData, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_visible"
              checked={taskData.is_visible}
              onChange={(e) => setTaskData({ ...taskData, is_visible: e.target.checked })}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
            />
            <label htmlFor="is_visible" className="text-sm font-bold text-slate-700">
              Visible to others (uncheck to hide)
            </label>
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate(`/tasks/${id}`)}
              className="flex-1 py-4 px-4 border border-slate-300 rounded-xl shadow-sm text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-slate-900 hover:bg-slate-800 transition disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
