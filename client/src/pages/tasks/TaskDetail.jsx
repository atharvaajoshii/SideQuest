import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, DollarSign, User, ShieldCheck, Edit, Trash2, Loader2, CheckCircle, MessageSquare } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, API } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await fetch(`${API}/api/tasks/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTask(data);
        } else {
          navigate('/search');
        }
      } catch (err) {
        console.error('Failed to fetch task:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id, API, navigate]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/tasks/mine');
      } else {
        alert('Failed to delete task');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleApplyForTask = async () => {
    // Validate
    const finalPrice = offerPrice ? parseFloat(offerPrice) : parseFloat(task.price);
    if (isNaN(finalPrice) || finalPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    // Check if logged in
    if (!token) {
      alert('Please log in to apply for tasks');
      navigate('/signin');
      return;
    }

    setApplying(true);
    try {
      console.log('Applying for task:', id);
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Data:', { message: applyMessage.trim(), offered_price: finalPrice });

      const res = await fetch(`${API}/api/orders/task/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: applyMessage.trim(),
          offered_price: finalPrice
        })
      });

      const data = await res.json();
      console.log('Response status:', res.status);
      console.log('Response data:', data);

      if (res.ok) {
        alert('Application submitted! The task poster will review your offer.');
        setShowApplyForm(false);
        setApplyMessage('');
        setOfferPrice('');
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (err) {
      console.error('Failed to apply:', err);
      alert('Could not connect to server. Is it running?');
    } finally {
      setApplying(false);
    }
  };

  const isOwner = user && task && task.poster_id === user.id;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-slate-100 text-slate-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading task...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Task not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-indigo-50 text-primary text-sm font-bold px-4 py-1.5 rounded-full">
                {task.category || 'General'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-sm flex items-center gap-1">
                  <Clock size={16} /> Posted {new Date(task.created_at).toLocaleDateString()}
                </span>
                {isOwner && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/tasks/${id}/edit`)}
                      className="text-slate-400 hover:text-primary transition p-1"
                      title="Edit task"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                      title="Delete task"
                    >
                      {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
              {task.title}
            </h1>

            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              {task.description}
            </p>

            {task.deadline && (
              <div className="flex items-center gap-2 text-slate-700 font-medium mb-4">
                <Clock size={18} className="text-slate-400" /> Deadline: {task.deadline}
              </div>
            )}

            <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin className="text-slate-400" /> {task.location || 'Remote / Online'}
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="text-green-500" /> Verified Payment
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(task.status)}`}>
                  {task.status || 'Open'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar (Right) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price & Apply Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            <h3 className="text-slate-500 font-medium mb-2">Reward</h3>
            <div className="text-4xl font-extrabold text-secondary flex items-center justify-center gap-1 mb-6">
              <DollarSign size={32} />{task.price}
            </div>

            {isOwner ? (
              <>
                <p className="text-sm text-slate-500 mb-3">This is your task</p>
                <button
                  onClick={() => navigate(`/tasks/${id}/edit`)}
                  className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-md hover:bg-slate-800 transition mb-3"
                >
                  Edit Task
                </button>
              </>
            ) : task.status === 'Open' ? (
              <>
                {showApplyForm ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Your Offer (₹)</label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        placeholder={task.price}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Message (optional)</label>
                      <textarea
                        value={applyMessage}
                        onChange={(e) => setApplyMessage(e.target.value)}
                        placeholder="Explain why you're the best fit for this task..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={handleApplyForTask}
                      disabled={applying}
                      className="w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {applying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      {applying ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button
                      onClick={() => { setShowApplyForm(false); setApplyMessage(''); setOfferPrice(''); }}
                      className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="block w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-md hover:bg-green-600 transition mb-3 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={20} />
                      Apply for Task
                    </button>
                    <Link to={`/negotiate/${id}`} className="block w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition mb-3">
                      <MessageSquare size={18} className="inline mr-2" />
                      Negotiate First
                    </Link>
                    <p className="text-xs text-slate-400">Apply directly or negotiate the price with the poster.</p>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">This task is {task.status}</p>
                <button disabled className="block w-full bg-slate-200 text-slate-400 py-4 rounded-xl font-bold cursor-not-allowed">
                  Task Not Available
                </button>
              </>
            )}
          </div>

          {/* Poster Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About the Poster</h3>
            <Link to={`/freelancer/${task.poster_id}`} className="flex items-center gap-4 mb-4 group">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold group-hover:bg-primary group-hover:text-white transition">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-primary transition">{task.poster_name || 'Anonymous'}</h4>
                <p className="text-sm text-slate-500">Member since 2025</p>
              </div>
            </Link>
            <div className="text-sm text-slate-600">
              <span className="font-bold text-slate-900">5</span> quests posted • <span className="font-bold text-slate-900">100%</span> pay rate
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
