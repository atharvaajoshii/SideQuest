import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Clock, CheckSquare, ArrowLeft } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        // Fetch freelancer details
        const freelancerRes = await fetch(`${API}/api/users/${data.order.freelancer_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (freelancerRes.ok) {
          const freelancerData = await freelancerRes.json();
          setFreelancer(freelancerData);
        }
      }
    } catch (err) {
      console.error('Failed to fetch order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    try {
      const res = await fetch(`${API}/api/orders/${orderId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Order marked as completed!');
        fetchOrder();
      }
    } catch (err) {
      console.error('Failed to mark order as completed:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock size={24} />;
      case 'in_progress':
        return <Clock size={24} />;
      case 'completed':
        return <CheckCircle size={24} />;
      case 'delivered':
        return <CheckSquare size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-slate-400';
      case 'in_progress':
        return 'text-primary';
      case 'completed':
        return 'text-green-600';
      case 'delivered':
        return 'text-blue-600';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'delivered':
        return 'Awaiting Review';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 font-medium mb-4">Order not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 bg-primary text-slate-900 rounded-lg font-semibold"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Header */}
          <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
            <div>
              <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">
                Order #{order.id}
              </span>
              <h1 className="text-2xl font-extrabold">{order.task_title || 'Task Order'}</h1>
            </div>
            <div className="text-right">
              <span className="block text-slate-400 text-sm">Agreed Price</span>
              <span className="text-3xl font-extrabold text-secondary">₹{order.agreed_price}</span>
            </div>
          </div>

          {/* Freelancer Info */}
          {freelancer && (
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-primary to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {freelancer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{freelancer.name}</p>
                  <p className="text-xs text-slate-500">Freelancer</p>
                </div>
              </div>
              <Link
                to={`/freelancer/${freelancer.id}`}
                className="px-4 py-2 text-sm font-medium text-primary bg-yellow-100 rounded-lg hover:bg-yellow-200 transition"
              >
                View Profile
              </Link>
            </div>
          )}

          {/* Timeline */}
          <div className="p-8 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">Order Status</h3>
            <div className="space-y-6">
              {/* Step 1: Offer Accepted */}
              <div className={`flex items-center gap-4 ${['in_progress', 'completed', 'delivered'].includes(order.status) ? 'text-green-600' : 'text-slate-300'}`}>
                <CheckCircle className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Offer Accepted</h4>
                  <p className="text-sm text-slate-500">{formatDate(order.created_at)}</p>
                </div>
              </div>

              {/* Step 2: Freelancer is working */}
              <div className={`flex items-center gap-4 ${['in_progress', 'completed', 'delivered'].includes(order.status) ? getStatusColor('in_progress') : 'text-slate-300'}`}>
                <Clock className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">Freelancer is working</h4>
                  <p className="text-sm text-slate-500">
                    {['in_progress', 'completed', 'delivered'].includes(order.status)
                      ? `${freelancer?.name || 'Freelancer'} is currently completing the task.`
                      : 'Waiting for freelancer to start.'}
                  </p>
                </div>
              </div>

              {/* Step 3: Awaiting Review / Completed */}
              <div className={`flex items-center gap-4 ${order.status === 'delivered' ? 'text-blue-600' : order.status === 'completed' ? 'text-green-600' : 'text-slate-300'}`}>
                <CheckSquare className="flex-shrink-0" size={24} />
                <div>
                  <h4 className="font-bold">
                    {order.status === 'completed' ? 'Order Completed' : 'Awaiting Review'}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {order.status === 'completed'
                      ? 'This order has been completed.'
                      : order.status === 'delivered'
                      ? 'Task delivered. Please review and confirm.'
                      : 'Waiting for final submission.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="p-8 grid grid-cols-2 gap-4 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">Order Date</p>
              <p className="font-semibold text-slate-900">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Status</p>
              <p className={`font-semibold ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </p>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-8 bg-slate-50 flex gap-4">
            {freelancer && (
              <Link
                to={`/freelancer/${freelancer.id}`}
                className="flex-1 bg-white border border-slate-300 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-100 transition text-center"
              >
                View {freelancer.name?.split(' ')[0]}'s Profile
              </Link>
            )}
            {order.status !== 'completed' && (
              <button
                onClick={handleMarkCompleted}
                className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-bold shadow-md hover:bg-primary transition"
              >
                Mark as Completed
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
