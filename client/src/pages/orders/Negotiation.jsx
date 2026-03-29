import React, { useState } from 'react';
import { Link, Send, User } from 'lucide-react';

export default function Negotiation() {
  const [message, setMessage] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <Link to="/freelancer/456" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-indigo-100 text-primary rounded-full flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-white transition">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-primary transition">Alex (Freelancer)</h3>
              <p className="text-xs text-slate-500">Task: Debug React Assignment</p>
            </div>
          </Link>
          <div className="text-right">
            <span className="text-sm text-slate-500 block">Current Offer</span>
            <span className="text-xl font-extrabold text-secondary">₹350</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50">
          <div className="flex gap-4">
            <div className="h-8 w-8 bg-indigo-100 rounded-full flex-shrink-0"></div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-slate-700 max-w-md">
              Hi! I saw your post. I can fix the infinite loop in your React code tonight, but since it's urgent, would you be willing to do ₹350?
            </div>
          </div>
          
          <div className="flex gap-4 flex-row-reverse">
            <div className="bg-primary p-4 rounded-2xl rounded-tr-none shadow-sm text-white max-w-md">
              Yeah, 350 works for me if you can get it done in the next 2 hours!
            </div>
          </div>

          {/* System Offer Card */}
          <div className="mx-auto bg-white border-2 border-primary rounded-xl p-4 max-w-sm text-center shadow-md my-6">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Official Offer</span>
            <h2 className="text-3xl font-extrabold text-slate-900 my-2">₹350</h2>
            <p className="text-sm text-slate-500 mb-4">Alex has offered to complete the task for this amount.</p>
            <button className="w-full bg-secondary text-white py-2 rounded-lg font-bold hover:bg-green-600 transition">
              Accept Offer & Start Order
            </button>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); setMessage(''); }}>
            <input
              type="text"
              className="flex-grow px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Type a message or counter-offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-primary transition flex items-center gap-2">
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}