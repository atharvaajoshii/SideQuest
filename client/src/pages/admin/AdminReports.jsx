import React from 'react';
import { Link, AlertTriangle, CheckCircle, Ban, Eye } from 'lucide-react';

export default function AdminReports() {
  const pendingReports = [
    { id: 1, type: 'Task', target: 'Write my essay for me', reportedBy: 'student99', reason: 'Academic Dishonesty', status: 'Pending' },
    { id: 2, type: 'User', target: 'JohnDoe123', reportedBy: 'alice_smith', reason: 'Harassment in Chat', status: 'Pending' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-red-500" /> Pending Reports
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-bold text-slate-600">Type</th>
                <th className="p-4 font-bold text-slate-600">Reported Target</th>
                <th className="p-4 font-bold text-slate-600">Reason</th>
                <th className="p-4 font-bold text-slate-600">Reported By</th>
                <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingReports.map((report) => (
                <tr key={report.id} className="hover:bg-red-50 transition">
                  <td className="p-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${report.type === 'User' ? 'bg-indigo-100 text-primary' : 'bg-orange-100 text-orange-600'}`}>
                      {report.type}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-900">{report.target}</td>
                  <td className="p-4 text-red-600 font-medium">{report.reason}</td>
                  <td className="p-4">
                    <Link to={`/freelancer/${report.reportedBy}`} className="text-slate-500 text-sm hover:text-primary transition">
                      {report.reportedBy}
                    </Link>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition font-bold text-sm" title="Dismiss Report">
                      Ignore
                    </button>
                    <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-bold text-sm flex items-center gap-1" title="Take Action">
                      <Ban size={14} /> Ban/Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pendingReports.length === 0 && (
             <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
               <CheckCircle size={48} className="text-green-400 mb-4" />
               <p className="font-bold text-lg text-slate-700">All caught up!</p>
               <p>There are no pending reports to review.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}