import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Search() {
  const { user, token, API } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ["All", "Design", "Development", "Writing", "Video", "Tutoring", "Other"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Read query params from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const category = params.get('category');

    if (search) setSearchTerm(search);
    if (category && category !== 'All') setSelectedCategory(category);
  }, [location.search]);

  // Fetch tasks from backend (excludes current user's tasks)
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "All") params.append('category', selectedCategory);
        if (searchTerm) params.append('search', searchTerm);

        console.log('Fetching tasks from:', `${API}/api/tasks?${params}`);
        const res = await fetch(`${API}/api/tasks?${params}`);

        let data;
        try {
          data = await res.json();
        } catch {
          data = [];
        }

        console.log('Browse tasks response:', data);

        if (res.ok) {
          setTasks(data);
        } else {
          setError('Failed to load tasks');
        }

      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Server error. Is backend running?');
      }

      setLoading(false);
    };

    fetchTasks();
  }, [selectedCategory, searchTerm, user, API]);

  // Filter logic
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || task.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Browse Tasks 🔍
          </h1>

          {/* Search Bar */}
          <div className="flex gap-4">
            <input
              type="text"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Search for 'React', 'Logo', 'Tutor'..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-slate-500">Loading tasks...</p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* No tasks */}
        {!loading && filteredTasks.length === 0 && (
          <p className="text-center text-slate-500">No tasks found.</p>
        )}

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition flex flex-col cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {task.category || 'General'}
                </span>
                <span className="text-slate-900 font-bold text-lg">
                  ₹{task.price}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {task.title}
              </h3>

              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {task.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Posted by {task.poster_name || 'Anonymous'}
                </span>
                <button className="bg-slate-900 text-white font-medium py-2 px-4 rounded-xl hover:bg-slate-800 transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}