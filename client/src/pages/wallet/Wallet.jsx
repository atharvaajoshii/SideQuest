import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Plus, Download } from 'lucide-react';

export default function Wallet() {
  const transactions = [
    { id: 1, type: 'earned', title: 'Task: Design Logo', amount: '+ ₹500', date: 'Oct 24, 2026', status: 'Completed' },
    { id: 2, type: 'spent', title: 'Task: Debug React Code', amount: '- ₹300', date: 'Oct 22, 2026', status: 'Completed' },
    { id: 3, type: 'added', title: 'Added to Wallet', amount: '+ ₹1000', date: 'Oct 20, 2026', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Balance Card */}
        <div className="bg-slate-900 rounded-3xl p-8 md:p-10 shadow-xl mb-8 relative overflow-hidden">
          {/* Background Design */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
          
          <div className="relative z-10">
            <p className="text-slate-400 font-medium mb-1">Total Available Balance</p>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-8">₹1,250<span className="text-2xl text-slate-400">.00</span></h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button className="flex-1 bg-slate-900 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition">
                <Plus size={20} /> Add Funds
              </button>
              <button className="flex-1 bg-white text-slate-900 py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition">
                <Download size={20} /> Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Transaction History</h2>
          </div>
          
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'spent' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-secondary'}`}>
                    {tx.type === 'spent' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{tx.title}</h4>
                    <p className="text-sm text-slate-500">{tx.date} • {tx.status}</p>
                  </div>
                </div>
                <div className={`text-lg font-extrabold ${tx.type === 'spent' ? 'text-slate-900' : 'text-secondary'}`}>
                  {tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}