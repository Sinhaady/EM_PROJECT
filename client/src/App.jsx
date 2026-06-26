import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import Features from './pages/Features';
import GoogleAuthCallback from './pages/GoogleAuthCallback';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const isSuperAdmin =
    user?.role === 'super_admin' &&
    user?.email?.toLowerCase() === 'adityasinha296@gmail.com';
  const isAdminRoute = location.pathname.startsWith('/super-admin');
  const isAuthCallback = location.pathname.startsWith('/auth/google/callback');

  if (isSuperAdmin && !isAdminRoute && !isAuthCallback) {
    return <Navigate to="/super-admin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090b12] text-slate-100 font-sans">
      {!isAdminRoute && <Navbar />}

      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
          <Route path="/features" element={<Features />} />
          <Route path='/about' element={<About/>}/>
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App; 
