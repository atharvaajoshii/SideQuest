import React, { useState, useEffect } from 'react';
// FIX: removed unused `Link` import
import { AlertTriangle, CheckCircle, Ban, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/reports?status=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
    setLoading(false);
  };

  const dismissReport = async (reportId) => {
    try {
      // FIX: was calling /dismiss which doesn't exist — the registered route is /resolve
      const res = await fetch(`${API}/api/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error('Failed to dismiss report:', err);
    }
  };

  const deleteTarget = async (report) => {
    const endpoint = report.type === 'Task'
      ? `${API}/api/admin/tasks/${report.target_id}`
      : `${API}/api/admin/users/${report.target_id}`;

    if (!confirm(`Are you sure you want to delete this ${report.type?.toLowerCase()}?`)) return;
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error('Failed to delete target:', err);
    }
  };

  const viewTarget = (report) => {
    if (report.type === 'Task' && report.target_id) {
      navigate(`/tasks/${report.target_id}`);
    } else if (report.target_id) {
      navigate(`/freelancer/${report.target_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
          <AlertTriangle className="text-red-500" /> Reports
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'resolved', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-bold text-sm capitalize transition ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 size={40} className="animate-spin mx-auto text-primary mb-2" />
              <p className="text-slate-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
              <CheckCircle size={48} className="text-green-400 mb-4" />
              <p className="font-bold text-lg text-slate-700">All caught up!</p>
              <p>There are no {filter !== 'all' ? filter : ''} reports to review.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-bold text-slate-600">Type</th>
                  <th className="p-4 font-bold text-slate-600">Reported Target</th>
                  <th className="p-4 font-bold text-slate-600">Reason</th>
                  <th className="p-4 font-bold text-slate-600">Reported By</th>
                  <th className="p-4 font-bold text-slate-600">Status</th>
                  <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-red-50 transition">
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        report.type === 'User' ? 'bg-indigo-100 text-primary' : 'bg-orange-100 text-orange-600'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{report.target || report.target_name || 'Unknown'}</td>
                    <td className="p-4 text-red-600 font-medium">{report.reason}</td>
                    <td className="p-4">
                      <span className="text-slate-500 text-sm">{report.reported_by_name || report.reportedBy || '—'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                        report.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {report.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => viewTarget(report)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => dismissReport(report.id)}
                            className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition font-bold text-sm"
                          >
                            Ignore
                          </button>
                          <button
                            onClick={() => deleteTarget(report)}
                            className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition font-bold text-sm flex items-center gap-1"
                          >
                            <Ban size={14} /> Ban/Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}