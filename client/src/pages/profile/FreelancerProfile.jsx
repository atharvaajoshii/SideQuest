import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Briefcase, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ReportUserModal from '../../components/ReportUserModal';

const API = import.meta.env.VITE_API_URL;

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [id]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
    setLoading(false);
  };

  const handleMessageClick = () => {
    navigate(`/messages/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={40} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2">User not found</h2>
          <button onClick={() => navigate('/search')} className="text-primary hover:underline">
            Browse other profiles
          </button>
        </div>
      </div>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-indigo-600 rounded-full mx-auto mb-4 border-4 border-white shadow-md flex items-center justify-center text-3xl font-extrabold text-white">
              {initials}
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 mb-4 flex items-center justify-center gap-1">
              <MapPin size={16} /> {user?.location || 'Campus'}
            </p>

            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg mb-6">
              <Star fill="currentColor" size={20} />
              {user?.rating?.toFixed(1) || '0.0'}
              <span className="text-slate-400 text-sm font-normal">
                ({user?.review_count || 0} reviews)
              </span>
            </div>

            <button
              onClick={handleMessageClick}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition flex justify-center items-center gap-2 mb-3"
            >
              <MessageSquare size={18} /> Message {user?.name?.split(' ')[0]}
            </button>

            {/* Report User Button */}
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold border border-red-200 hover:bg-red-100 transition flex justify-center items-center gap-2 text-sm"
            >
              <AlertTriangle size={18} /> Report User
            </button>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-primary" /> About Me
            </h3>
            <p className="text-slate-600 leading-relaxed">
              {user?.bio || 'No bio available.'}
            </p>
            {user?.skills && user.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {user.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-bold">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Reviews</h3>
            {user?.reviews && user.reviews.length > 0 ? (
              <div className="space-y-4">
                {user.reviews.map((review, i) => (
                  <div key={i} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Star fill="currentColor" className="text-amber-500" size={16} />
                      <span className="font-bold text-slate-800">{review.rating}/5</span>
                    </div>
                    <p className="text-sm text-slate-500">{review.comment || 'No comment'}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(review.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No reviews yet.</p>
            )}
          </div>
        </div>

      </div>

      {/* Report User Modal */}
      {showReportModal && (
        <ReportUserModal
          userId={id}
          userName={user?.name}
          onClose={() => setShowReportModal(false)}
          onReported={() => {}}
        />
      )}
    </div>
  );
}
