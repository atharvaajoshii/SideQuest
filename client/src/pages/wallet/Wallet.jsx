import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Wallet() {
  const { user, token, API } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch(`${API}/api/users/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
    setLoading(false);
  };

  const formatAmount = (amount) => {
    const num = parseFloat(amount);
    return num.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTypeIcon = (type) => {
    if (type === 'withdrawal' || type === 'spent') return <ArrowUpRight size={24} />;
    return <ArrowDownLeft size={24} />;
  };

  const getTypeColor = (type) => {
    if (type === 'withdrawal' || type === 'spent') return 'bg-red-100 text-red-600';
    return 'bg-green-100 text-green-600';
  };

  const getAmountSign = (type) => {
    if (type === 'withdrawal' || type === 'spent') return '-';
    return '+';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Balance Card */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-xl mb-8 relative overflow-hidden">
          {/* Background Design */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>

          <div className="relative z-10">
            <p className="text-slate-400 font-medium mb-1">Total Available Balance</p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-2">
              {formatAmount(user?.wallet_balance || 0)}
            </h1>
            <p className="text-slate-500 text-sm">Earned from completed tasks</p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading transactions...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No transactions yet</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(tx.type)}`}>
                      {getTypeIcon(tx.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{tx.description || tx.type}</h4>
                      <p className="text-sm text-slate-500">
                        {formatDate(tx.created_at)} • {tx.status || 'Completed'}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-extrabold ${tx.type === 'withdrawal' || tx.type === 'spent' ? 'text-slate-900' : 'text-green-600'}`}>
                    {getAmountSign(tx.type)} {formatAmount(tx.amount)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}