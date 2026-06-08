import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import CreateEvent from './pages/CreateEvent';
import Dashboard from './pages/Dashboard';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import Features from './pages/Features';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090b12] text-slate-100 font-sans">
      <Navbar />

      <main className="grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/new" element={<CreateEvent />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/features" element={<Features />} />
          <Route path='/about' element={<About/>}/>
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App; 