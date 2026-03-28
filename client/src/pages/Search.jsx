import React, { useState, useEffect } from 'react';

export default function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ["All", "Coding", "Design", "Writing", "Physical / Errands", "Tutoring"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // 🔥 Fetch tasks from backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`);

        let data;
        try {
          data = await res.json();
        } catch {
          data = [];
        }

        if (res.ok) {
          setTasks(data);
        } else {
          setError('Failed to load tasks');
        }

      } catch (err) {
        setError('Server error. Is backend running?');
      }

      setLoading(false);
    };

    fetchTasks();
  }, []);

  // 🔍 Filter logic
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
            Find a SideQuest 🔍
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
                  ? 'bg-primary text-white shadow-md'
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
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary transition flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {task.category}
                </span>
                <span className="text-secondary font-bold text-lg">
                  ₹{task.price}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {task.title}
              </h3>

              <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                {task.description}
              </p>

              <button className="mt-auto w-full bg-slate-900 text-white font-medium py-2.5 rounded-xl hover:bg-primary transition">
                View Details
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}