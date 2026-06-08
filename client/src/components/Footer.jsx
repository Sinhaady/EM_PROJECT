import { Link } from 'react-router-dom';
import { Camera, Mail, MapPin, Phone, Play, Send } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#050914] px-4 py-14 text-slate-300 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="pointer-events-none absolute left-[-12%] top-0 h-96 w-96 rounded-full bg-violet-700/18 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-30%] right-[-8%] h-112 w-md rounded-full bg-cyan-500/18 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.35fr]">
          <div>
            <Link to="/" className="mb-7 inline-flex items-center gap-3">
              <span className="h-4 w-4 rounded-full bg-linear-to-br from-violet-500 to-cyan-400" />
              <span className="text-4xl font-black tracking-tight text-white">Ventro</span>
            </Link>
            <p className="max-w-sm text-lg leading-relaxed text-slate-400">
              AI-powered event discovery platform helping you find concerts, workshops, comedy nights, sports events,
              and unforgettable experiences tailored to your vibe.
            </p>
            <div className="mt-9 flex gap-5">
              {[
                { label: 'Instagram', icon: Camera },
                { label: 'Twitter', icon: Send },
                { label: 'YouTube', icon: Play },
              ].map(({ label, icon: Icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                >
                  <Icon size={24} />
                </a> 
              ))}
            </div>   
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.35em] text-white">Quick Links</h3>
            <nav className="flex flex-col gap-5 text-lg text-slate-300">
              <Link to="/events" className="hover:text-white">Events</Link>
              <Link to="/dashboard" className="hover:text-white">My Tickets</Link>
              <Link to="/#ask-ai" className="hover:text-white">AI Chat</Link>
              <Link to="/dashboard" className="hover:text-white">Profile</Link>
            </nav>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.35em] text-white">Company</h3>
            <nav className="flex flex-col gap-5 text-lg text-slate-300">
              <Link to="/about" className="hover:text-white">About Us</Link>
              <a href="#" className="hover:text-white">Careers</a>
              <a href="#" className="hover:text-white">Blog</a>
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
            </nav>
          </div>

          <div>
            <h3 className="mb-8 text-sm font-black uppercase tracking-[0.35em] text-white">Contact</h3>
            <div className="space-y-6">
              {[
                {
                  icon: MapPin,
                  title: 'Location',
                  text: 'Gaya, Bihar, India',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  text: 'help@ventro.in',
                },
                {
                  icon: Phone,
                  title: 'Phone',
                  text: '+91 11 2345 6789',
                },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <Icon size={21} />
                  </span>
                  <div>
                    <p className="font-bold text-white">{title}</p>
                    <p className="text-slate-300">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} Ventro. All rights reserved.</p>
          <p>
            Built with <span className="px-1 text-blue-400">{'\u2665'}</span> for event lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
