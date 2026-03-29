import React from 'react';
import { Link, CheckCircle, Clock, CheckSquare } from 'lucide-react';

export default function OrderPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">Order #88492</span>
              <h1 className="text-2xl font-extrabold">Debug React Assignment</h1>
            </div>
            <div className="text-right">
              <span className="block text-slate-400 text-sm">Agreed Price</span>
              <span className="text-3xl font-extrabold text-secondary">₹350</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Order Status</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-green-600">
                <CheckCircle className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Offer Accepted</h4>
                  <p className="text-sm text-slate-500">Oct 24, 8:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-primary">
                <Clock className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Freelancer is working</h4>
                  <p className="text-sm text-slate-500">Alex is currently completing the task.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <CheckSquare className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-slate-400">Awaiting Review</h4>
                  <p className="text-sm text-slate-400">Waiting for final submission.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-8 bg-slate-50 flex gap-4">
            <Link to="/freelancer/456" className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition text-center">
              View Alex's Profile
            </Link>
            <button className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition">
              Mark as Completed
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}