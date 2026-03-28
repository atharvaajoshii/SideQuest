import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import the new Layout
import Layout from './components/Layout';

// Root Pages
import Landing from './pages/Landing'; 
import Home from './pages/Home';
import Search from './pages/Search';

// Auth
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// Tasks
import PostTask from './pages/tasks/PostTask';
import TaskDetail from './pages/tasks/TaskDetail';
import MyTasks from './pages/tasks/MyTasks';

// Profile
import UserProfile from './pages/profile/UserProfile';
import FreelancerProfile from './pages/profile/FreelancerProfile';

// Orders & Wallet
import OrderPage from './pages/orders/OrderPage';
import Negotiation from './pages/orders/Negotiation';
import Wallet from './pages/wallet/Wallet';

// Admin (We'll keep these separate from the main layout)
import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTasks from './pages/admin/AdminTasks';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminStats from './pages/admin/AdminStats';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES (No Navbar/Footer) */}
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* MAIN APP ROUTES (Wrapped in the Global Layout) */}
        <Route element={<Layout />}>
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

        {/* ADMIN ROUTES (Usually have their own specific layout) */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/tasks" element={<AdminTasks />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/reports" element={<AdminReports />} />
      </Routes>
    </Router>
  );
}

export default App;