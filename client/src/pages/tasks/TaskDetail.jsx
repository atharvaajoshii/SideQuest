import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, User, ShieldCheck } from 'lucide-react';

export default function TaskDetail() {
  const { id } = useParams(); // Gets the task ID from the URL

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-6">
              <span className="bg-indigo-50 text-primary text-sm font-bold px-4 py-1.5 rounded-full">
                Coding
              </span>
              <span className="text-slate-500 text-sm flex items-center gap-1">
                <Clock size={16} /> Posted 2 hours ago
              </span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
              Debug my React Assignment (Urgent)
            </h1>
            
            <p className="text-slate-600 leading-relaxed text-lg mb-8">
              I am working on my final web dev project and my useEffect hook is causing an infinite loop. I need someone who knows React and Vite to hop on a quick call or look at my GitHub repo to fix the bug. Needs to be done by tonight!
            </p>

            <div className="flex flex-wrap gap-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <MapPin className="text-slate-400" /> Remote / Online
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="text-green-500" /> Verified Payment
              </div>
            </div>
          </div>
        </div>

        {/* Action Sidebar (Right) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Price & Apply Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            <h3 className="text-slate-500 font-medium mb-2">Bounty Reward</h3>
            <div className="text-4xl font-extrabold text-secondary flex items-center justify-center gap-1 mb-6">
              <DollarSign size={32} />300
            </div>
            
            <Link to={`/negotiate/${id || '123'}`} className="block w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-md hover:bg-primary transition mb-3">
              Make an Offer
            </Link>
            <p className="text-xs text-slate-400">You can negotiate the final price with the poster.</p>
          </div>

          {/* Poster Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">About the Poster</h3>
            <Link to="/freelancer/123" className="flex items-center gap-4 mb-4 group">
              <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold group-hover:bg-primary group-hover:text-white transition">
                <User size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 group-hover:text-primary transition">Sarah Jenkins</h4>
                <p className="text-sm text-slate-500">Joined 2025</p>
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