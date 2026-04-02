import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Ban, Eye, Loader2, User, FileText, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminReports() {
  const { token, API } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
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

  const resolveReport = async (reportId, status = 'resolved') => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/reports/${reportId}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
    setActionLoading(false);
  };

  const banUser = async (report) => {
    if (!confirm(`Are you sure you want to suspend this user?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/reports/${report.id}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'resolved', action: 'ban_user' })
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error('Failed to ban user:', err);
    }
    setActionLoading(false);
  };

  const deleteTarget = async (report) => {
    const endpoint = report.type === 'task'
      ? `${API}/api/admin/tasks/${report.target_id}`
      : `${API}/api/admin/users/${report.target_id}`;

    if (!confirm(`Are you sure you want to delete this ${report.type}?`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        resolveReport(report.id);
        fetchReports();
      }
    } catch (err) {
      console.error('Failed to delete target:', err);
    }
    setActionLoading(false);
  };

  const viewTarget = (report) => {
    if (report.type === 'task' && report.target_id) {
      navigate(`/tasks/${report.target_id}`);
    } else if (report.target_id) {
      navigate(`/freelancer/${report.target_id}`);
    }
  };

  const getTypeIcon = (type) => {
    return type === 'user' ? <User size={16} /> : <FileText size={16} />;
  };

  const getTypeColor = (type) => {
    return type === 'user'
      ? 'bg-indigo-100 text-primary'
      : 'bg-orange-100 text-orange-600';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 flex items-center gap-3">
            <AlertTriangle className="text-red-500" size={32} /> Reports Dashboard
          </h1>
          <p className="text-slate-600">Review and manage user-submitted reports</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-amber-600 mb-1">
              {reports.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-slate-500">Pending Reports</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {reports.filter(r => r.type === 'user').length}
            </div>
            <div className="text-sm text-slate-500">User Reports</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {reports.filter(r => r.type === 'task').length}
            </div>
            <div className="text-sm text-slate-500">Task Reports</div>
          </div>
        </div>

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
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-sm">
                    <th className="p-4 font-bold text-slate-600">Type</th>
                    <th className="p-4 font-bold text-slate-600">Reported Target</th>
                    <th className="p-4 font-bold text-slate-600">Reason</th>
                    <th className="p-4 font-bold text-slate-600">Reported By</th>
                    <th className="p-4 font-bold text-slate-600">Date</th>
                    <th className="p-4 font-bold text-slate-600">Status</th>
                    <th className="p-4 font-bold text-slate-600 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reports.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-red-50 transition cursor-pointer"
                      onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                    >
                      <td className="p-4">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 w-fit ${getTypeColor(report.type)}`}>
                          {getTypeIcon(report.type)}
                          {report.type === 'user' ? 'User' : 'Task'}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-900">
                        {report.target_name || 'Unknown'}
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-red-600 font-medium text-sm truncate">{report.reason}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-500 text-sm">{report.reporter_name || 'Anonymous'}</span>
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(report.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${
                          report.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {report.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); viewTarget(report); }}
                            className="p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); resolveReport(report.id); }}
                                disabled={actionLoading}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-bold text-sm disabled:opacity-50"
                                title="Mark as Resolved"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); banUser(report); }}
                                disabled={actionLoading || report.type !== 'user'}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-bold text-sm disabled:opacity-50"
                                title="Ban User"
                              >
                                <Ban size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Shield size={24} className="text-primary" />
                  Report Details
                </h3>
                <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Report Type</div>
                  <div className="font-semibold capitalize">{selectedReport.type}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Target</div>
                  <div className="font-semibold">{selectedReport.target_name || 'Unknown'}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Reason</div>
                  <div className="font-semibold text-red-600">{selectedReport.reason}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Reported By</div>
                  <div className="font-semibold">{selectedReport.reporter_name || 'Anonymous'}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <div className="font-semibold capitalize">{selectedReport.status}</div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Date</div>
                  <div className="font-semibold">{new Date(selectedReport.created_at).toLocaleString('en-IN')}</div>
                </div>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { resolveReport(selectedReport.id); setSelectedReport(null); }}
                    className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 transition"
                  >
                    Mark as Resolved
                  </button>
                  {selectedReport.type === 'user' && (
                    <button
                      onClick={() => { banUser(selectedReport); setSelectedReport(null); }}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition"
                    >
                      Suspend User
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple X icon component
function X({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
