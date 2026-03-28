import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Search from './pages/Search';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import PostTask from './pages/tasks/PostTask';
import TaskDetail from './pages/tasks/TaskDetail';
import MyTasks from './pages/tasks/MyTasks';
import UserProfile from './pages/profile/UserProfile';
import FreelancerProfile from './pages/profile/FreelancerProfile';
import OrderPage from './pages/orders/OrderPage';
import Negotiation from './pages/orders/Negotiation';
import Wallet from './pages/wallet/Wallet';
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminStats from './pages/admin/AdminStats';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';

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

        {/* PROTECTED — needs login */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/tasks/post" element={<PostTask />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/tasks/mine" element={<MyTasks />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/freelancer/:id" element={<FreelancerProfile />} />
          <Route path="/orders" element={<OrderPage />} />
          <Route path="/negotiate/:id" element={<Negotiation />} />
          <Route path="/wallet" element={<Wallet />} />
        </Route>

        {/* ADMIN — needs admin role */}
        <Route path="/admin" element={<AdminRoute><AdminHome /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/tasks" element={<AdminRoute><AdminTasks /></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
        <Route path="/admin/stats" element={<AdminRoute><AdminStats /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
      </Routes>
    </Router>
  );
}

export default App;