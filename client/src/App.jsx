import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';

const About = lazy(() => import('./pages/About'));
const CreateEvent = lazy(() => import('./pages/CreateEvent'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Events = lazy(() => import('./pages/Events'));
const Features = lazy(() => import('./pages/Features'));
const GoogleAuthCallback = lazy(() => import('./pages/GoogleAuthCallback'));
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));

const PageFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-400">
    Loading page…
  </div>
);

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
        <Suspense fallback={<PageFallback />}>
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
            <Route path="/about" element={<About />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App; 
