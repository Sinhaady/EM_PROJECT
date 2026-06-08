import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User, Menu, X } from "lucide-react";
import Features from "../pages/Features";
import About from "../pages/About";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Features', path: '/features' },
    { name: 'AboutUs', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path) => {
    if (path.includes('#')) {
      return location.pathname === '/' && location.hash === path.substring(path.indexOf('#'));
    }
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-transparent pt-6 pb-4 px-6 md:px-12 z-40 relative w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link className="flex items-center gap-3" to="/">
          <span className="font-bold text-xl tracking-tight text-white hidden sm:block">Ventro</span>
        </Link>

        {/* For Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link key={link.name} to={link.path} className={`text-[13px] font-medium transition-colors relative pb-1 ${
                active ? 'text-white' : 'text-white/60 hover:text-white'
              }`}>
                {link.name}
                {active && (<span className="absolute bottom-0 left-0 w-full h-0.5 bg-linear-to-r from-[#8155ff] to-[#6035f5] rounded-full" />)}
              </Link>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="text-white/60 hover:text-white transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-[#8155ff] text-white flex items-center justify-center font-bold text-xs shadow-md">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="text-sm font-medium text-white/90">{user.name || user.email?.split('@')[0]}</span>
              </div>
              <button onClick={handleLogout} className="text-white/40 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium h-9 px-3 border border-transparent hover:border-red-500/30 hover:bg-white/5 rounded-full">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-white hover:bg-white/5 border border-white/20 px-6 py-2 rounded-full font-medium transition-all text-[13px]">
                Log in
              </Link>
              <Link to="/register" className="bg-linear-to-r from-[#8155ff] to-[#6035f5] text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 text-[13px]">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden text-white/60 hover:text-white transition-colors border border-white/10 p-2 rounded-lg bg-white/5" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile navbar */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0D0B1A]/95 backdrop-blur-2xl border-b border-white/5 py-4 px-6 flex flex-col gap-4 shadow-2xl z-50">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`font-medium text-sm py-2 ${
                  active ? 'text-white border-l-2 border-[#8155ff] pl-3 -ml-3' : 'text-white/80 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="h-px bg-white/10 my-2"></div>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white font-medium text-sm py-2">
                Dashboard
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-left text-red-400 font-medium text-sm py-2 flex items-center gap-2">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-white text-center border border-white/20 px-6 py-2.5 rounded-full font-medium transition-all text-sm hover:bg-white/5">
                Log in
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-linear-to-r from-[#8155ff] to-[#6035f5] text-white text-center px-6 py-2.5 rounded-full font-medium shadow-lg shadow-purple-500/20 text-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;