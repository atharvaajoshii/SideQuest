import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Loader2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminTasks() {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      tasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.poster_name?.toLowerCase().includes(q)
      )
    );
  }, [search, tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        setFiltered(data);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
    setLoading(false);
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchTasks();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const flagged = tasks.filter(t => t.report_count > 0).length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Platform Tasks</h1>
          {flagged > 0 && (
            <span className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-full text-sm">
              {flagged} flagged task{flagged > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search tasks..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600">Task Title</th>
                <th className="p-4 font-bold text-slate-600">Posted By</th>
                <th className="p-4 font-bold text-slate-600">Price</th>
                <th className="p-4 font-bold text-slate-600">Status</th>
                <th className="p-4 font-bold text-slate-600">Reports</th>
                <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 size={40} className="animate-spin mx-auto text-primary mb-2" />
                    <p className="text-slate-500">Loading tasks...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No tasks found</td>
                </tr>
              ) : (
                filtered.map((task) => (
                  <tr key={task.id} className={`hover:bg-slate-50 transition ${task.report_count > 0 ? 'bg-red-50' : ''}`}>
                    <td className="p-4 font-bold text-slate-900 max-w-xs truncate">{task.title}</td>
                    <td className="p-4 text-slate-600">{task.poster_name || 'Unknown'}</td>
                    <td className="p-4 text-slate-700 font-bold">₹{task.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                        task.status === 'open' ? 'bg-green-100 text-green-700' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        task.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {task.status?.replace('_', ' ') || 'open'}
                      </span>
                    </td>
                    <td className="p-4">
                      {task.report_count > 0 ? (
                        <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-xs">
                          {task.report_count} Flag{task.report_count > 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">Clean</span>
                      )}
                    </td>
                    <td className="p-4 flex justify-center gap-4">
                      <button
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        className="text-slate-500 hover:text-primary transition"
                        title="View Task"
                      >
                        <ExternalLink size={18} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete Task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}