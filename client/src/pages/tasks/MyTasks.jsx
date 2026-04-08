import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Edit, Trash2, Eye, EyeOff, Loader2, MessageSquare } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function MyTasks() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      const res = await fetch(`${API}/api/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setActionLoading(taskId);
    try {
      const res = await fetch(`${API}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      } else {
        alert('Failed to delete task');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVisibility = async (taskId) => {
    setActionLoading(taskId);
    try {
      const res = await fetch(`${API}/api/tasks/${taskId}/visibility`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(tasks.map(t =>
          t.id === taskId ? { ...t, is_visible: data.is_visible } : t
        ));
        alert(data.message);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to toggle visibility');
      }
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
      alert('Server error. Is backend running?');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-amber-100 text-amber-700';
      case 'completed':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Posted Quests</h1>
            <p className="text-slate-500 mt-1">Manage the tasks you've asked others to do.</p>
          </div>
          <Link to="/tasks/post" className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition">
            + Post New
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">You haven't posted any tasks yet.</p>
            <Link to="/tasks/post" className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
              Post Your First Task
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-bold text-slate-600">Quest Title</th>
                    <th className="p-4 font-bold text-slate-600">Reward</th>
                    <th className="p-4 font-bold text-slate-600">Status</th>
                    <th className="p-4 font-bold text-slate-600">Offers</th>
                    <th className="p-4 font-bold text-slate-600 text-center">Visibility</th>
                    <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-bold text-slate-900">{task.title}</td>
                      <td className="p-4 font-medium text-slate-600">₹{task.price}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(task.status_display || task.status)}`}>
                          {task.status_display || task.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/negotiate-poster/${task.id}`)}
                          className="font-medium text-primary hover:text-green-600 transition"
                        >
                          {task.offers_count || 0} offers
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleVisibility(task.id)}
                          disabled={actionLoading === task.id}
                          className={`p-2 rounded-lg transition ${
                            task.is_visible !== false
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-slate-400 hover:bg-slate-100'
                          }`}
                          title={task.is_visible !== false ? 'Click to hide' : 'Click to show'}
                        >
                          {actionLoading === task.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : task.is_visible !== false ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </td>
                      <td className="p-4 flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/negotiate-poster/${task.id}`)}
                          className="text-slate-400 hover:text-green-600 transition"
                          title="View applicants & negotiate"
                        >
                          <MessageSquare size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="text-slate-400 hover:text-primary transition"
                          title="View task"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/tasks/${task.id}/edit`)}
                          className="text-slate-400 hover:text-slate-700 transition"
                          title="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          disabled={actionLoading === task.id}
                          className="text-slate-400 hover:text-red-500 transition"
                          title="Delete task"
                        >
                          {actionLoading === task.id ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Trash2 size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
