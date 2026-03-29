import React from 'react';
import { Star, MessageSquare, Briefcase, MapPin } from 'lucide-react';

export default function FreelancerProfile() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center sticky top-8">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" className="w-32 h-32 bg-slate-100 rounded-full mx-auto mb-4 border-4 border-white shadow-md" />
            <h2 className="text-2xl font-extrabold text-slate-900">Alex Smith</h2>
            <p className="text-slate-500 mb-4 flex items-center justify-center gap-1">
              <MapPin size={16} /> Campus Dorm B
            </p>
            
            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-lg mb-6">
              <Star fill="currentColor" size={20} /> 4.9 <span className="text-slate-400 text-sm font-normal">(12 reviews)</span>
            </div>

            <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition flex justify-center items-center gap-2">
              <MessageSquare size={18} /> Message Alex
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
              Hi! I'm a 3rd-year CS major. I specialize in debugging React applications, writing Python scripts, and I'm also pretty good at UI/Design. I deliver tasks quickly and communicate often!
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">React</span>
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">Python</span>
              <span className="px-3 py-1 bg-indigo-50 text-primary rounded-full text-sm font-bold">Graphic Design</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Recent Reviews</h3>
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Star fill="currentColor" className="text-amber-500" size={16} />
                  <span className="font-bold text-slate-800">Fixed my assignment bug!</span>
                </div>
                <p className="text-sm text-slate-500">"Alex was super fast and explained the code to me perfectly. Highly recommend."</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}