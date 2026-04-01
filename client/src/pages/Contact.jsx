import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, MessageSquare, Send, CheckCircle, Clock, Shield } from 'lucide-react';
import AuthHeader from '../components/AuthHeader';
import AuthFooter from '../components/AuthFooter';

export default function Contact() {
  const { API } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    }

    setLoading(false);
  };

  const contactMethods = [
    {
      icon: <Mail size={24} />,
      title: 'Email',
      value: 'support@sidequest.com',
      description: 'We\'ll respond within 24 hours'
    },
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      value: 'Available in app',
      description: 'Chat with our support team'
    },
    {
      icon: <Clock size={24} />,
      title: 'Response Time',
      value: 'Usually within 2 hours',
      description: 'During business hours'
    }
  ];

  return (
    <>
      <AuthHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Have questions? We're here to help and make your SideQuest experience amazing.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white">Send us a Message</h2>
                  <p className="text-indigo-100 text-sm mt-1">Fill out the form below and we'll get back to you</p>
                </div>

                <div className="p-8">
                  {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 text-sm">{error}</span>
                    </div>
                  )}

                  {submitted ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                        <CheckCircle size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                      <p className="text-slate-600 mb-6">Thank you for contacting us. We'll respond within 24 hours.</p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="text-primary font-medium hover:text-indigo-600"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-slate-50"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-slate-50"
                          placeholder="student@college.edu"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                        <select
                          required
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-slate-50"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        >
                          <option value="">Select a subject</option>
                          <option value="general">General Inquiry</option>
                          <option value="support">Technical Support</option>
                          <option value="billing">Billing Question</option>
                          <option value="report">Report a Problem</option>
                          <option value="feedback">Feedback</option>
                          <option value="partnership">Partnership</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                        <textarea
                          required
                          rows={5}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm bg-slate-50 resize-none"
                          placeholder="Tell us how we can help..."
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold rounded-xl hover:from-primary hover:to-indigo-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send size={20} />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Contact Information</h2>
                <p className="text-slate-600 mb-6">
                  Choose your preferred way to reach us. We're committed to providing excellent support.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{method.title}</h3>
                      <p className="text-primary font-medium">{method.value}</p>
                      <p className="text-sm text-slate-500">{method.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-900 p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-white mb-2">Quick Question?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Check our FAQ page for instant answers to common questions.
                </p>
                <Link
                  to="/faq"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:text-indigo-400 transition-colors"
                >
                  Browse FAQ
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Safety Notice */}
              <div className="mt-6 bg-amber-50 border border-amber-200 p-6 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="text-amber-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-1">Safety First</h4>
                    <p className="text-sm text-amber-700">
                      Never share your password. Our support team will never ask for your password via email or chat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AuthFooter />
      </div>
    </>
  );
}
