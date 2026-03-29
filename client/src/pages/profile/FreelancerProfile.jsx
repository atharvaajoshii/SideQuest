import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageSquare, Briefcase, MapPin, Mail } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function FreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFreelancer();
  }, [id]);

  const fetchFreelancer = async () => {
    try {
      const res = await fetch(`${API}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFreelancer(data);
    } catch (err) {
      console.error('Failed to fetch freelancer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = () => {
    // Navigate to messages page to chat with this freelancer
    navigate(`/messages/${id}`);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (!freelancer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex items-center justify-center text-white font-extrabold text-4xl mx-auto mb-4 border-4 border-white shadow-md">
              {getInitials(freelancer.name)}
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900">{freelancer.name}</h2>
            <p className="text-slate-500 text-sm mb-2">{freelancer.email}</p>
            <p className="text-slate-500 mb-4 flex items-center justify-center gap-1">
              <MapPin size={16} /> Campus
            </p>

            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg mb-6">
              <Star fill="currentColor" size={20} /> 4.9 <span className="text-slate-400 text-sm font-normal">(12 reviews)</span>
            </div>

            {/* Message Button */}
            <button
              onClick={handleMessageClick}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition flex justify-center items-center gap-2 mb-3"
            >
              <MessageSquare size={18} /> Message {freelancer.name.split(' ')[0]}
            </button>

            {/* Email Button (alternative) */}
            <a
              href={`mailto:${freelancer.email}`}
              className="w-full bg-white text-slate-700 py-3 rounded-xl font-bold border border-slate-200 hover:bg-slate-50 transition flex justify-center items-center gap-2"
            >
              <Mail size={18} /> Email
            </a>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="text-primary" /> About Me
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Hi! I'm a {freelancer.role === 'admin' ? 'platform administrator' : 'freelancer'} ready to help with your tasks.
              I specialize in delivering quality work with quick turnaround times.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">Fast Delivery</span>
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">Quality Work</span>
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">Good Communication</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star fill="currentColor" className="text-amber-500" size={16} />
                  <span className="font-bold text-slate-800">Great work!</span>
                </div>
                <p className="text-sm text-slate-500">"Delivered on time and explained everything perfectly. Highly recommend!"</p>
              </div>
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star fill="currentColor" className="text-amber-500" size={16} />
                  <span className="font-bold text-slate-800">Very helpful</span>
                </div>
                <p className="text-sm text-slate-500">"Quick response and great communication throughout the task."</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
