import React from 'react';
import { Trash2, ExternalLink } from 'lucide-react';

export default function AdminTasks() {
  const tasks = [
    { id: 1, title: 'Debug React Assignment', poster: 'Sarah Jenkins', price: '₹300', reports: 0 },
    { id: 2, title: 'Write my essay for me (Plagiarism)', poster: 'Mike Smith', price: '₹1000', reports: 4 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Platform Tasks</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600">Task Title</th>
                <th className="p-4 font-bold text-slate-600">Posted By</th>
                <th className="p-4 font-bold text-slate-600">Reports</th>
                <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr key={task.id} className={`hover:bg-slate-50 transition ${task.reports > 0 ? 'bg-red-50' : ''}`}>
                  <td className="p-4 font-bold text-slate-900">{task.title}</td>
                  <td className="p-4 text-slate-600">{task.poster}</td>
                  <td className="p-4">
                    {task.reports > 0 ? (
                      <span className="text-red-600 font-bold bg-red-100 px-2 py-1 rounded-full text-xs">{task.reports} Flags</span>
                    ) : (
                      <span className="text-slate-400 text-sm">Clean</span>
                    )}
                  </td>
                  <td className="p-4 flex justify-center gap-4">
                    <button className="text-slate-500 hover:text-primary transition" title="View Task"><ExternalLink size={18} /></button>
                    <button className="text-red-500 hover:text-red-700 transition" title="Delete Task"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}