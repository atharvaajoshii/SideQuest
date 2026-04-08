import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Send, Loader2, CheckCircle, IndianRupee, ArrowLeft,
  Users, MessageSquare, PenLine, RotateCcw, ChevronRight, X
} from 'lucide-react';

export default function TaskPosterNegotiation() {
  const { id: taskId } = useParams();
  const navigate = useNavigate();
  const { user, token, API } = useAuth();
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // ── Data ─────────────────────────────────────────────────────────────────
  const [task, setTask]               = useState(null);
  const [negotiations, setNegotiations] = useState([]); // all freelancers who opened negotiations
  const [selected, setSelected]       = useState(null); // currently viewed negotiation
  const [messages, setMessages]       = useState([]);

  // ── UI ───────────────────────────────────────────────────────────────────
  const [loading, setLoading]           = useState(true);
  const [msgLoading, setMsgLoading]     = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [accepting, setAccepting]       = useState(false);
  const [message, setMessage]           = useState('');
  const [finalPrice, setFinalPrice]     = useState('');
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceInput, setPriceInput]     = useState('');
  const [successMsg, setSuccessMsg]     = useState('');
  const [errorMsg, setErrorMsg]         = useState('');

  // ── Auto-scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Initial load: task + all negotiations ────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      try {
        const res = await fetch(`${API}/api/tasks/${taskId}`);
        if (!res.ok) { navigate('/tasks/mine'); return; }
        const data = await res.json();
        if (data.poster_id !== user.id) { navigate(`/tasks/${taskId}`); return; }
        setTask(data);
        setFinalPrice(data.price);
        await loadNegotiations();
      } catch (err) {
        console.error('Init error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [taskId, user]);

  // ── Poll for new messages when a negotiation is selected ─────────────────
  useEffect(() => {
    if (!selected) return;
    pollRef.current = setInterval(() => loadMessages(selected, false), 8000);
    return () => clearInterval(pollRef.current);
  }, [selected]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const flash = (type, text) => {
    if (type === 'success') { setSuccessMsg(text); setErrorMsg(''); }
    else                    { setErrorMsg(text);   setSuccessMsg(''); }
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4500);
  };

  const fmtTime = (ts) =>
    new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const fmtDate = (ts) => {
    const d = new Date(ts);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const grouped = messages.reduce((acc, msg) => {
    const key = fmtDate(msg.created_at);
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  // Latest counter-offer sent by the freelancer in this conversation
  const latestCounterOffer = messages
    .filter(m => m.sender_id === selected?.freelancer_id && m.offered_price)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

  // ── Data loaders ──────────────────────────────────────────────────────────

  const loadNegotiations = async () => {
    try {
      const res = await fetch(`${API}/api/negotiations/task/${taskId}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiations(data.negotiations || []);
      }
    } catch (err) {
      console.error('loadNegotiations error:', err);
    }
  };

  // Load messages between poster (current user) and the freelancer
  const loadMessages = async (negotiation, showSpinner = true) => {
    if (showSpinner) setMsgLoading(true);
    try {
      // Use the messages endpoint — fetch conversation between poster and freelancer
      const res = await fetch(`${API}/api/messages/${negotiation.freelancer_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('loadMessages error:', err);
    } finally {
      if (showSpinner) setMsgLoading(false);
    }
  };

  const selectNegotiation = async (neg) => {
    clearInterval(pollRef.current);
    setSelected(neg);
    setMessages([]);
    setEditingPrice(false);
    setMessage('');
    // Pre-fill price input with freelancer's latest counter-offer if available
    if (neg.latest_offered_price) {
      setPriceInput(String(neg.latest_offered_price));
    } else {
      setPriceInput('');
    }
    await loadMessages(neg, true);
  };

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          receiver_id: selected.freelancer_id,
          content: message,
          negotiation_id: selected.negotiation_id || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.message]);
        setMessage('');
      } else {
        const err = await res.json();
        flash('error', err.message || 'Failed to send message');
      }
    } catch {
      flash('error', 'Server error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update task price — this is NOT accepting an offer, it's a price proposal
  const handleUpdatePrice = async (priceOverride) => {
    const newPrice = parseFloat(priceOverride ?? priceInput);
    if (!newPrice || newPrice <= 0) { flash('error', 'Enter a valid price'); return; }
    setAccepting(true);
    try {
      const res = await fetch(`${API}/api/tasks/update-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskId: parseInt(taskId),
          newPrice,
          freelancerId: selected?.freelancer_id ?? user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTask(prev => ({ ...prev, price: newPrice }));
        setFinalPrice(newPrice);
        setEditingPrice(false);
        flash('success', `Task price updated to ₹${newPrice}`);
        // Notify via message if a freelancer is selected
        if (selected) {
          await fetch(`${API}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              receiver_id: selected.freelancer_id,
              content: `I've updated the task price to ₹${newPrice}. Let me know if you'd like to proceed!`,
              negotiation_id: selected.negotiation_id || null,
            }),
          });
          await loadMessages(selected, false);
        }
      } else {
        flash('error', data.message || 'Failed to update price');
      }
    } catch {
      flash('error', 'Server error. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  // Accept the freelancer's counter-offer and create an order
  const handleAcceptOffer = async () => {
    if (!latestCounterOffer || !selected) return;
    const price = parseFloat(latestCounterOffer.offered_price);
    setAccepting(true);
    try {
      // Create the order — this is the real "acceptance"
      const orderRes = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          freelancer_id: selected.freelancer_id,
          task_id: parseInt(taskId),
          agreed_price: price,
        }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        flash('error', orderData.message || 'Failed to create order');
        return;
      }

      // Also update task price to match
      await fetch(`${API}/api/tasks/update-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          taskId: parseInt(taskId),
          newPrice: price,
          freelancerId: selected.freelancer_id,
        }),
      });

      setTask(prev => ({ ...prev, price }));
      setFinalPrice(price);
      flash('success', `Offer accepted! Order created at ₹${price}.`);
      navigate(`/orders/${orderData.order.id}`);
    } catch {
      flash('error', 'Server error. Please try again.');
    } finally {
      setAccepting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F2' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: '#1A1A2E', margin: '0 auto 12px' }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Loading negotiation room…</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F6F2' }}>
        <p style={{ color: '#64748b' }}>Task not found.</p>
      </div>
    );
  }

  const selectedName    = selected?.freelancer_name || 'Freelancer';
  const selectedInitial = selectedName.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', background: '#F7F6F2', padding: '24px 16px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/tasks/${taskId}`)}
            style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 10, padding: '7px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#475569', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={14} /> Back to Task
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: '#1A1A2E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {task.title}
            </h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Negotiation Room · Task Poster View</p>
          </div>
          <div style={{ background: '#1A1A2E', color: '#FFD93D', borderRadius: 12, padding: '7px 16px', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <IndianRupee size={14} />
            {parseFloat(finalPrice).toFixed(0)}
            <span style={{ color: 'rgba(255,217,61,0.55)', fontWeight: 400, fontSize: 11 }}>current price</span>
          </div>
        </div>

        {/* ── Flash banners ─────────────────────────────────────────────── */}
        {successMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '10px 16px', marginBottom: 14, color: '#166534', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={15} /> {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 16px', marginBottom: 14, color: '#991b1b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <X size={15} /> {errorMsg}
          </div>
        )}

        {/* ── Two-column layout ─────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '272px 1fr', gap: 14, height: 'calc(100vh - 190px)', minHeight: 500 }}>

          {/* ── Left sidebar: negotiations list ──────────────────────── */}
          <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Sidebar header */}
            <div style={{ padding: '15px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={15} style={{ color: '#64748b' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>Negotiations</span>
              <span style={{ marginLeft: 'auto', background: '#f1f5f9', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, color: '#475569' }}>
                {negotiations.length}
              </span>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {negotiations.length === 0 ? (
                <div style={{ padding: '32px 18px', textAlign: 'center' }}>
                  <Users size={28} style={{ color: '#e2e8f0', margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No negotiations yet</p>
                  <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>Freelancers who message you about this task will appear here</p>
                </div>
              ) : (
                negotiations.map((neg) => {
                  const isActive  = selected?.freelancer_id === neg.freelancer_id;
                  const initial   = (neg.freelancer_name || 'F').charAt(0).toUpperCase();
                  const offeredPrice = neg.latest_offered_price;
                  return (
                    <button
                      key={neg.freelancer_id}
                      onClick={() => selectNegotiation(neg)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '11px 18px',
                        background: isActive ? '#f8fafc' : 'transparent',
                        borderLeft: `3px solid ${isActive ? '#FFD93D' : 'transparent'}`,
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 11,
                        transition: 'background 0.12s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: isActive ? '#1A1A2E' : '#e2e8f0',
                        color: isActive ? '#FFD93D' : '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 800,
                      }}>{initial}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {neg.freelancer_name || 'Freelancer'}
                        </div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                          {offeredPrice
                            ? <span>Counter-offer: <span style={{ fontWeight: 700, color: '#0ea5e9' }}>₹{parseFloat(offeredPrice).toFixed(0)}</span></span>
                            : <span style={{ color: '#cbd5e1' }}>No offer yet</span>
                          }
                        </div>
                        {neg.last_message && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {neg.last_message}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer: quick price update */}
            <div style={{ padding: '14px 18px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <PenLine size={11} /> Update Task Price
              </p>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }}>₹</span>
                  <input
                    type="number"
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder={String(task.price)}
                    style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 26, paddingRight: 8, paddingTop: 8, paddingBottom: 8, border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13, fontWeight: 700, color: '#1e293b', outline: 'none' }}
                  />
                </div>
                <button
                  onClick={() => handleUpdatePrice()}
                  disabled={accepting || !priceInput}
                  style={{ background: '#1A1A2E', color: '#FFD93D', border: 'none', borderRadius: 9, padding: '8px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, opacity: accepting || !priceInput ? 0.5 : 1 }}
                >
                  {accepting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                  Set
                </button>
              </div>
              <p style={{ fontSize: 10, color: '#cbd5e1', marginTop: 5 }}>Current: ₹{parseFloat(task.price).toFixed(2)}</p>
            </div>
          </div>

          {/* ── Right: chat panel ────────────────────────────────────── */}
          {!selected ? (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
              <MessageSquare size={44} style={{ color: '#e2e8f0', marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
                {negotiations.length === 0 ? 'No negotiations yet' : 'Select a negotiation'}
              </h3>
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                {negotiations.length === 0
                  ? 'When freelancers message you about this task, they\'ll appear in the sidebar.'
                  : 'Pick a freelancer from the sidebar to view your conversation and manage the final price.'
                }
              </p>
              <Link to="/messages" style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1A1A2E', textDecoration: 'none', background: '#f1f5f9', padding: '8px 16px', borderRadius: 10 }}>
                <MessageSquare size={14} /> Open All Messages
              </Link>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* Chat header */}
              <div style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1A1A2E', color: '#FFD93D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                  {selectedInitial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b' }}>{selectedName}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {latestCounterOffer
                      ? <span>Latest counter-offer: <span style={{ color: '#0ea5e9', fontWeight: 600 }}>₹{parseFloat(latestCounterOffer.offered_price).toFixed(0)}</span></span>
                      : 'No counter-offer yet'
                    }
                  </div>
                </div>

                {/* Inline price editor */}
                {editingPrice ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: 13 }}>₹</span>
                      <input
                        autoFocus
                        type="number"
                        value={priceInput}
                        onChange={e => setPriceInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdatePrice(); if (e.key === 'Escape') setEditingPrice(false); }}
                        style={{ paddingLeft: 26, paddingRight: 10, paddingTop: 8, paddingBottom: 8, border: '2px solid #FFD93D', borderRadius: 9, width: 96, fontSize: 14, fontWeight: 700, color: '#1e293b', outline: 'none' }}
                      />
                    </div>
                    <button
                      onClick={() => handleUpdatePrice()}
                      disabled={accepting}
                      style={{ background: '#1A1A2E', color: '#FFD93D', border: 'none', borderRadius: 9, padding: '8px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      {accepting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />} Save
                    </button>
                    <button
                      onClick={() => setEditingPrice(false)}
                      style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 9, padding: 8, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>Task Price</div>
                      <div style={{ fontSize: 19, fontWeight: 800, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IndianRupee size={14} />{parseFloat(finalPrice).toFixed(0)}
                      </div>
                    </div>
                    <button
                      onClick={() => { setPriceInput(String(finalPrice)); setEditingPrice(true); }}
                      style={{ background: '#FFD93D', border: 'none', borderRadius: 9, padding: '8px 12px', cursor: 'pointer', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700 }}
                    >
                      <PenLine size={13} /> Edit Price
                    </button>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', background: '#f8fafc' }}>
                {msgLoading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
                    <Loader2 size={24} className="animate-spin" style={{ color: '#94a3b8' }} />
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '56px 20px' }}>
                    <MessageSquare size={32} style={{ color: '#e2e8f0', margin: '0 auto 10px' }} />
                    <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>No messages yet</p>
                    <p style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>Start the conversation below</p>
                  </div>
                ) : (
                  Object.entries(grouped).map(([date, msgs]) => (
                    <div key={date}>
                      <div style={{ textAlign: 'center', margin: '14px 0 10px' }}>
                        <span style={{ background: '#e2e8f0', color: '#64748b', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{date}</span>
                      </div>
                      {msgs.map((msg, idx) => {
                        const isOwn = msg.sender_id === user?.id;
                        return (
                          <div key={msg.id || idx} style={{ display: 'flex', gap: 8, marginBottom: 8, flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                            {!isOwn && (
                              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>
                                {selectedInitial}
                              </div>
                            )}
                            <div style={{ maxWidth: '68%' }}>
                              <div style={{
                                padding: '9px 13px',
                                borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                background: isOwn ? '#1A1A2E' : 'white',
                                color: isOwn ? 'rgba(255,255,255,0.9)' : '#1e293b',
                                fontSize: 13, lineHeight: 1.5,
                                border: isOwn ? 'none' : '1px solid #e2e8f0',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                              }}>
                                {msg.content}
                                {/* Show offered price badge inline if present */}
                                {msg.offered_price && (
                                  <div style={{
                                    marginTop: 6,
                                    background: isOwn ? 'rgba(255,217,61,0.12)' : '#f0fdf4',
                                    border: isOwn ? '1px solid rgba(255,217,61,0.25)' : '1px solid #86efac',
                                    borderRadius: 7, padding: '4px 9px',
                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                    fontSize: 11, fontWeight: 700,
                                    color: isOwn ? '#FFD93D' : '#166534',
                                  }}>
                                    <IndianRupee size={10} /> {parseFloat(msg.offered_price).toFixed(0)} offered
                                  </div>
                                )}
                              </div>
                              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, textAlign: isOwn ? 'right' : 'left', paddingLeft: isOwn ? 0 : 3, paddingRight: isOwn ? 3 : 0 }}>
                                {fmtTime(msg.created_at)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                {/* Counter-offer action card — shown when freelancer has a pending offer different from current price */}
                {latestCounterOffer && parseFloat(latestCounterOffer.offered_price) !== parseFloat(finalPrice) && (
                  <div style={{ background: 'white', border: '2px solid #0ea5e9', borderRadius: 14, padding: '14px 18px', margin: '14px 0', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 2px 8px rgba(14,165,233,0.1)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 3px' }}>
                        Counter-Offer from {selectedName}
                      </p>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#1e293b', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <IndianRupee size={16} />{parseFloat(latestCounterOffer.offered_price).toFixed(0)}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
                        Current task price: ₹{parseFloat(finalPrice).toFixed(0)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {/* This button creates an order = true acceptance */}
                      <button
                        onClick={handleAcceptOffer}
                        disabled={accepting}
                        style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: 9, padding: '8px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        {accepting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        Accept & Start Order
                      </button>
                      {/* This button proposes a new price (no order created) */}
                      <button
                        onClick={() => { setPriceInput(String(finalPrice)); setEditingPrice(true); }}
                        style={{ background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 9, padding: '6px 16px', fontWeight: 600, fontSize: 12, cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}
                      >
                        <RotateCcw size={12} /> Propose Different Price
                      </button>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9', background: 'white' }}>
                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={`Message ${selectedName}…`}
                    style={{ flex: 1, padding: '10px 15px', border: '1.5px solid #e2e8f0', borderRadius: 11, fontSize: 13, outline: 'none', background: '#f8fafc', color: '#1e293b' }}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    style={{ background: '#1A1A2E', color: '#FFD93D', border: 'none', borderRadius: 11, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, opacity: submitting || !message.trim() ? 0.5 : 1 }}
                  >
                    {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    Send
                  </button>
                </form>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
