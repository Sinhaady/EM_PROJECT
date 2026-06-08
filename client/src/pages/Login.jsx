import { motion } from 'framer-motion';
import { ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const eventImages = [
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
];

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const errorMsg = await login(formData.email, formData.password);

    if (errorMsg) {
      toast.error(errorMsg);
    } else {
      toast.success('Welcome back!');
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10%] top-[-10%] h-112 w-md rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-112 w-md rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[30px_30px]" />
      </div>

      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-white/10 pt-20 lg:flex">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 max-w-xl px-12"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span className="text-sm text-zinc-300">AI Powered Event Platform</span>
          </div>

          <h1 className="text-6xl font-black leading-[0.95] tracking-tight">
            Welcome Back To <br />
            <span className="bg-linear-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Ventro
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
            Discover concerts, tournaments, workshops, comedy nights, and unforgettable experiences powered by AI.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-5">
            {eventImages.map((img, index) => (
              <motion.div
                key={img}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <img
                  src={img}
                  alt="Event preview"
                  className="h-40 w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-10 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-r from-violet-600 to-cyan-500 text-xl font-black text-white shadow-lg shadow-cyan-500/20">
              V
            </div>
            <span className="text-3xl font-black tracking-tight">Ventro</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-4xl font-black tracking-tight text-white">Sign In</h2>
            <p className="mt-3 text-zinc-400">Login to continue your event journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-400">
                Email Address
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-400/50 focus-within:bg-white/[0.07]">
                <Mail className="h-5 w-5 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="login-input flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-400">
                Password
              </label>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl transition-all duration-300 focus-within:border-cyan-400/50 focus-within:bg-white/[0.07]">
                <Lock className="h-5 w-5 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="login-input flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/10 bg-transparent accent-cyan-400"
                />
                Remember me
              </label>

              <button type="button" className="text-sm text-cyan-400 transition hover:text-cyan-300">
                Forgot Password?
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? undefined : { scale: 1.02 }}
              whileTap={isLoading ? undefined : { scale: 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-600 via-blue-500 to-cyan-500 py-4 font-semibold text-white shadow-2xl shadow-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </form>

          <p className="mt-10 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-cyan-400 transition hover:text-cyan-300">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
