import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Search from './pages/Search';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';
import About from './pages/About';
import Contact from './pages/Contact';
import PostTask from './pages/tasks/PostTask';
import TaskDetail from './pages/tasks/TaskDetail';
import MyTasks from './pages/tasks/MyTasks';
import TaskEdit from './pages/tasks/TaskEdit';
import UserProfile from './pages/profile/UserProfile';
import FreelancerProfile from './pages/profile/FreelancerProfile';
import OrderPage from './pages/orders/OrderPage';
import OrderDetail from './pages/orders/OrderDetail';
import Negotiation from './pages/orders/Negotiation';
import Wallet from './pages/wallet/Wallet';
import AdminLayout from './components/AdminLayout';
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminStats from './pages/admin/AdminStats';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminProfile from './pages/admin/AdminProfile';
import AdminContactMessages from './pages/admin/AdminContactMessages';
import Messages from './pages/Messages';
import MessageDetail from './pages/MessageDetail';
import Notifications from './pages/Notifications';

// Blocks logged-out users from accessing app pages
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 font-medium">Loading...</p>
    </div>
  );
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

// Blocks non-admins from admin pages
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<Navigate to="/help" replace />} />
        <Route path="/help" element={<Contact />} />

        {/* PROTECTED — needs login */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tasks/post" element={<PostTask />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/:id/edit" element={<TaskEdit />} />
          <Route path="/tasks/mine" element={<MyTasks />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/freelancer/:id" element={<FreelancerProfile />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/orders/:orderId" element={<OrderDetail />} />
          <Route path="/negotiate/:id" element={<Negotiation />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:userId" element={<MessageDetail />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        {/* ADMIN — needs admin role + persistent sidebar */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/tasks" element={<AdminTasks />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/stats" element={<AdminStats />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/messages" element={<AdminContactMessages />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;