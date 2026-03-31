import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, Hourglass } from 'lucide-react';

export default function OrderPage() {
  const { user, token, API } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API}/api/orders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, token, API]);

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    };
    const s = map[status?.toLowerCase()] || { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Unknown' };
    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${s.bg} ${s.text}`}>
        {s.label}
      </span>
    );
  };

  const getRoleInfo = (order) => {
    const isPoster = order.poster_id === user?.id;
    return {
      isPoster,
      roleLabel: isPoster ? 'You posted' : 'You\'re working',
      otherParty: isPoster ? order.freelancer_name : order.poster_name,
      otherPartyId: isPoster ? order.freelancer_id : order.poster_id,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Orders</h1>
            <p className="text-slate-500 mt-1">Track your ongoing quests and collaborations.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-500 mb-4">You haven't accepted any tasks yet.</p>
            <Link to="/search" className="inline-block px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">
              Browse Tasks
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const { isPoster, roleLabel, otherParty, otherPartyId } = getRoleInfo(order);
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="block">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{order.task_title}</h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {roleLabel} • {otherParty ? `with ${otherParty}` : 'Anonymous'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-extrabold text-slate-900">₹{order.agreed_price}</div>
                        <div className="mt-1">{getStatusBadge(order.status)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Created {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.status === 'completed' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={16} />
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
