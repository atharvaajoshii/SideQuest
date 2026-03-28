import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Eye } from 'lucide-react';

export default function MyTasks() {
  const myPostedTasks = [
    { id: 1, title: 'Need a logo for Tech Club', status: 'Open', offers: 3, price: '₹500' },
    { id: 2, title: 'Help moving out of dorm', status: 'In Progress', offers: 1, price: '₹400' },
    { id: 3, title: 'Calculus Tutoring', status: 'Completed', offers: 2, price: '₹600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Posted Quests</h1>
            <p className="text-slate-500 mt-1">Manage the tasks you've asked others to do.</p>
          </div>
          <Link to="/tasks/post" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition">
            + Post New
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600">Quest Title</th>
                  <th className="p-4 font-bold text-slate-600">Reward</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                  <th className="p-4 font-bold text-slate-600">Offers</th>
                  <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myPostedTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">{task.title}</td>
                    <td className="p-4 font-medium text-slate-600">{task.price}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        task.status === 'Open' ? 'bg-green-100 text-green-700' :
                        task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-primary">{task.offers} pending</td>
                    <td className="p-4 flex justify-center gap-3">
                      <button className="text-slate-400 hover:text-primary transition"><Eye size={18} /></button>
                      <button className="text-slate-400 hover:text-slate-700 transition"><Edit size={18} /></button>
                      <button className="text-slate-400 hover:text-red-500 transition"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}