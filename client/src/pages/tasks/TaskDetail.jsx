import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Clock, DollarSign, User, ShieldCheck, Edit, Trash2, Loader2, MessageSquare, CheckCircle, IndianRupee } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, API } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showNegotiateModal, setShowNegotiateModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkAppliedLoading, setCheckAppliedLoading] = useState(true);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
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

    const checkIfApplied = async () => {
      try {
        const res = await fetch(`${API}/api/orders/task/${id}/offers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const userOffer = data.offers?.find(o => o.freelancer_id === user?.id);
          setHasApplied(!!userOffer);
        }
      } catch (err) {
        console.error('Failed to check application status:', err);
      } finally {
        setCheckAppliedLoading(false);
      }
    };

    fetchData();
    if (user) checkIfApplied();
  }, [id, API, navigate, token, user]);

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

  const handleApplyNow = async () => {
    if (!confirm(`Apply for "${task.title}" at ₹${task.price}?`)) return;

    setApplying(true);
    try {
      const res = await fetch(`${API}/api/orders/task/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          offered_price: task.price,
          message: `I'd like to work on this task at the posted price of ₹${task.price}.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('Application submitted successfully! The task poster will be notified.');
        navigate('/tasks/mine');
      } else {
        alert(data.message || 'Failed to apply');
      }
    } catch (err) {
      console.error('Failed to apply:', err);
      alert('Server error. Please try again.');
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

  const handleOpenNegotiation = () => {
    navigate(`/negotiate/${id}`);
  };

  const handleStartMessage = () => {
    navigate(`/messages/${task.poster_id}`);
  };

  const handleSubmitOffer = async () => {
    setOfferError('');
    const amount = parseFloat(offerAmount);

    // Validation: must be a valid number > 0
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      setOfferError('Please enter a valid amount greater than 0');
      return;
    }

    setSubmittingOffer(true);
    try {
      const res = await fetch(`${API}/api/orders/task/${id}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          offered_price: amount,
          message: offerMessage || `I'd like to work on this task for ₹${amount}.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Offer of ₹${amount} submitted successfully!`);
        setOfferAmount('');
        setOfferMessage('');
        setShowNegotiateModal(false);
        setHasApplied(true);
      } else {
        setOfferError(data.message || 'Failed to submit offer');
      }
    } catch (err) {
      console.error('Failed to submit offer:', err);
      setOfferError('Server error. Please try again.');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleOfferAmountChange = (e) => {
    // Only allow numeric input
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setOfferAmount(value);
      setOfferError('');
    }
  };

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
          {/* Price Card */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            <h3 className="text-slate-500 font-medium mb-2 text-sm sm:text-base">Reward</h3>
            <div className="text-3xl sm:text-4xl font-extrabold text-secondary flex items-center justify-center gap-1 mb-6">
              <DollarSign size={28} sm:size={32} />{task.price}
            </div>

            {isOwner ? (
              <>
                <p className="text-sm text-slate-500 mb-3">This is your task</p>
                <button
                  onClick={() => navigate(`/tasks/${id}/edit`)}
                  className="block w-full bg-slate-900 text-white py-3 sm:py-4 rounded-xl font-bold shadow-md hover:bg-slate-800 transition text-sm sm:text-base"
                >
                  Edit Task
                </button>
              </>
            ) : task.status === 'Open' ? (
              <>
                {/* Apply Now - Primary Button (filled, visually stronger) */}
                {hasApplied ? (
                  <button
                    disabled
                    className="block w-full bg-green-200 text-green-800 py-3 sm:py-4 rounded-xl font-bold shadow-none mb-3 flex items-center justify-center gap-2 cursor-not-allowed text-sm sm:text-base"
                  >
                    <CheckCircle size={18} />
                    Applied
                  </button>
                ) : (
                  <button
                    onClick={handleApplyNow}
                    disabled={applying || checkAppliedLoading}
                    className="block w-full bg-green-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-md hover:bg-green-700 hover:shadow-lg transition mb-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {applying ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                    {applying ? 'Applying...' : checkAppliedLoading ? 'Loading...' : 'Apply Now'}
                  </button>
                )}
                {/* Negotiate - Secondary Button (outlined, visually lighter) */}
                <button
                  onClick={() => setShowNegotiateModal(true)}
                  className="block w-full bg-white text-slate-700 border-2 border-slate-300 py-3 sm:py-4 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-400 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <MessageSquare size={18} />
                  Negotiate
                </button>
                <p className="text-xs text-slate-400 mt-3 text-center px-2">
                  {hasApplied
                    ? "You've already applied to this task. The poster will contact you if interested."
                    : "Apply to accept the task at the posted price, or negotiate to discuss details."}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-500 mb-3">This task is {task.status}</p>
                <button disabled className="block w-full bg-slate-200 text-slate-400 py-3 sm:py-4 rounded-xl font-bold cursor-not-allowed text-sm sm:text-base">
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

      {/* Make an Offer Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 sm:p-6 relative my-auto">
            {/* Close button */}
            <button
              onClick={() => setShowNegotiateModal(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition p-1"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <IndianRupee size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Make an Offer</h2>
              <p className="text-sm text-slate-500 mt-2">
                Submit your price for this task
              </p>
            </div>

            {/* Task Info */}
            <div className="bg-slate-50 rounded-xl p-4 mb-5">
              <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{task.title}</h3>
              <p className="text-xs text-slate-500">Posted by: {task.poster_name || 'Anonymous'}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <DollarSign size={14} className="text-slate-500 flex-shrink-0" />
                <span className="text-lg font-bold text-slate-700">{task.price}</span>
                <span className="text-xs text-slate-400">(listed price)</span>
              </div>
            </div>

            {/* Offer Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Offer Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                <input
                  type="text"
                  value={offerAmount}
                  onChange={handleOfferAmountChange}
                  placeholder="Enter your offer amount"
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-xl font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition text-base sm:text-lg"
                  autoFocus
                />
              </div>
              {offerError && (
                <p className="text-sm text-red-600 mt-2">{offerError}</p>
              )}
            </div>

            {/* Optional Message */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Add a note <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="Add a note (optional)"
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition resize-none text-sm sm:text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Submit Offer - Primary */}
              <button
                onClick={handleSubmitOffer}
                disabled={submittingOffer || !offerAmount}
                className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {submittingOffer ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Submit Offer
                  </>
                )}
              </button>
              {/* Cancel - Secondary */}
              <button
                onClick={() => {
                  setShowNegotiateModal(false);
                  setOfferAmount('');
                  setOfferMessage('');
                  setOfferError('');
                }}
                disabled={submittingOffer}
                className="flex-1 bg-white text-slate-700 border-2 border-slate-300 py-3.5 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-400 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-slate-400 text-center mt-4">
              Your offer will be sent to the task poster for review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
