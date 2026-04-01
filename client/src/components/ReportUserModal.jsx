import { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReportUserModal({ userId, userName, onClose, onReported }) {
  const { API, token } = useAuth();
  const [reason, setReason] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const presetReasons = [
    { value: 'spam', label: 'Spam or misleading content' },
    { value: 'harassment', label: 'Harassment or abusive behavior' },
    { value: 'fraud', label: 'Fraudulent or scam attempt' },
    { value: 'inappropriate', label: 'Inappropriate profile content' },
    { value: 'other', label: 'Other (please specify)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalReason = selectedPreset === 'other' ? reason : presetReasons.find(p => p.value === selectedPreset)?.label || reason;

    if (!finalReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          target_id: userId,
          type: 'user',
          reason: finalReason
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          onReported?.();
          onClose();
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (err) {
      setError('Could not connect to the server');
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: '#fff' }}>

        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-white" />
            <h2 className="text-xl font-bold text-white">Report User</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report Submitted</h3>
              <p className="text-slate-600 text-sm">
                Thank you for helping keep SideQuest safe. Our team will review this report.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800">
                  <strong>Reporting:</strong> {userName}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Reports are anonymous and reviewed by our moderation team.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {/* Preset Reasons */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select a reason
                </label>
                <div className="space-y-2">
                  {presetReasons.map((preset) => (
                    <label
                      key={preset.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        selectedPreset === preset.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={preset.value}
                        checked={selectedPreset === preset.value}
                        onChange={(e) => setSelectedPreset(e.target.value)}
                        className="mt-0.5 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm text-slate-700">{preset.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Reason */}
              {(selectedPreset === 'other' || !selectedPreset) && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Additional Details {selectedPreset === 'other' && '(required)'}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide more details about why you're reporting this user..."
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all text-sm resize-none"
                    required={selectedPreset === 'other'}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={18} />
                      Submit Report
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
