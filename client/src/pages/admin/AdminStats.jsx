import React, { useState } from 'react';
import { Megaphone, Send, Trash2 } from 'lucide-react';

export default function AdminAnnouncements() {
  const [announcement, setAnnouncement] = useState('');

  const pastAnnouncements = [
    { id: 1, text: 'Welcome to the new SideQuest platform! Post your first task today.', date: 'Oct 20, 2026' },
    { id: 2, text: 'Platform maintenance scheduled for Sunday at 2 AM.', date: 'Oct 15, 2026' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <Megaphone className="text-primary" /> Global Announcements
        </h1>

        {/* Post New Announcement */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Post a New Announcement</h2>
          <textarea
            rows="3"
            className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-primary focus:border-primary transition mb-4"
            placeholder="Type a message that all students will see on their homepage..."
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
          ></textarea>
          <div className="flex justify-end">
            <button className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition flex items-center gap-2">
              <Send size={18} /> Publish to Platform
            </button>
          </div>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Announcement History</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pastAnnouncements.map((item) => (
              <div key={item.id} className="p-6 flex justify-between items-start hover:bg-slate-50 transition">
                <div>
                  <p className="text-slate-800 font-medium mb-1">{item.text}</p>
                  <p className="text-sm text-slate-500">{item.date}</p>
                </div>
                <button className="text-slate-400 hover:text-red-500 transition ml-4">
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}