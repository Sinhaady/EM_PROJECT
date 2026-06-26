import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sparkles } from "lucide-react";

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

// ── Static demo chat messages ──────────────────────────────────────────────────
const chatMessages = [
  { _id: 1, role: "assistant", text: "Hi! I'm Nexora. What kind of event are you looking for?" },
  { _id: 2, role: "user",      text: "Something fun this weekend in Patna 🎉" },
  { _id: 3, role: "assistant", text: "Found 3 events near you — a comedy night, a cricket match, and a music fest. Want details?" },
];

// ── Static demo cards ──────────────────────────────────────────────────────────
const DEMO_CARDS_COL_1 = [
  {
    id: 1,
    category: "SPORTS",
    title: "Cricket Championship",
    price: "₹200",
    color: "from-cyan-500/20 to-blue-600/20",
    accent: "text-cyan-400",
    img: "https://images.unsplash.com/photo-1540747913346-19212a4a5edd?w=400&auto=format&fit=crop",
  },
  {
    id: 2,
    category: "MUSIC",
    title: "Indie Music Fest",
    price: "₹599",
    color: "from-violet-500/20 to-purple-600/20",
    accent: "text-violet-400",
    img: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400&auto=format&fit=crop",
  },
  {
    id: 3,
    category: "TECH",
    title: "Startup Summit 2025",
    price: "₹999",
    color: "from-emerald-500/20 to-teal-600/20",
    accent: "text-emerald-400",
    img: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&auto=format&fit=crop",
  },
  {
    id: 4,
    category: "COMEDY",
    title: "Stand-Up Night",
    price: "₹349",
    color: "from-yellow-500/20 to-orange-600/20",
    accent: "text-yellow-400",
    img: "https://images.unsplash.com/photo-1527224538127-2104bb71c51b?w=400&auto=format&fit=crop",
  },
];

const DEMO_CARDS_COL_2 = [
  {
    id: 5,
    category: "ART",
    title: "Modern Art Expo",
    price: "₹150",
    color: "from-pink-500/20 to-rose-600/20",
    accent: "text-pink-400",
    img: "https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=400&auto=format&fit=crop",
  },
  {
    id: 6,
    category: "FOOD",
    title: "Food & Culture Fest",
    price: "Free",
    color: "from-orange-500/20 to-red-600/20",
    accent: "text-orange-400",
    img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop",
  },
  {
    id: 7,
    category: "FILM",
    title: "Indie Film Screening",
    price: "₹249",
    color: "from-blue-500/20 to-indigo-600/20",
    accent: "text-blue-400",
    img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&auto=format&fit=crop",
  },
  {
    id: 8,
    category: "FITNESS",
    title: "Yoga & Wellness Camp",
    price: "₹399",
    color: "from-teal-500/20 to-green-600/20",
    accent: "text-teal-400",
    img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&auto=format&fit=crop",
  },
];

// ── Single mini event card ─────────────────────────────────────────────────────
const MiniCard = ({ card }) => (
  <div
    className={`w-52.5 rounded-[22px] overflow-hidden border border-white/10 bg-linear-to-br ${card.color} backdrop-blur-xl shadow-xl shrink-0 mb-4`}
  >
    <div className="h-31.25 w-full overflow-hidden">
      <img
        src={card.img}
        alt={card.title}
        className="h-full w-full object-cover opacity-90"
        onError={(e) => { e.currentTarget.style.background = '#1e293b'; }}
      />
    </div>
    <div className="p-4">
      <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${card.accent}`}>
        {card.category}
      </p>
      <h3 className="text-sm font-bold text-white leading-snug mb-2">{card.title}</h3>
      <p className="text-base font-black text-white">{card.price}</p>
    </div>
  </div>
);

// ── Vertical marquee column ────────────────────────────────────────────────────
const VerticalMarquee = ({ cards, direction = "up", duration = 30 }) => {
  // Duplicate for seamless loop
  const doubled = [...cards, ...cards];
  const fromY = direction === "up" ? "0%" : "-50%";
  const toY   = direction === "up" ? "-50%" : "0%";

  return (
    <div
      className="relative h-130 overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
      }}
    >
      <motion.div
        className="flex flex-col will-change-transform"
        animate={{ y: [fromY, toY] }}
        transition={{
          duration,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {doubled.map((card, i) => (
          <MiniCard key={`${card.id}-${i}`} card={card} />
        ))}
      </motion.div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const Home = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const createEventPath = user ? '/events/new' : '/register';

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', {
          params: { status: 'PUBLISHED' },
        });
        setEvents(response.data.events?.slice(0, 3) || []);
      } catch (error) {
        console.error('Unable to load events', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030712] text-white">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen items-center overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[-10%] top-[-10%] h-150 w-150 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-5%] h-125 w-125 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[32px_32px]" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-12 px-6 pt-24 pb-16 lg:flex-row lg:items-center">

          {/* LEFT — text */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-zinc-300">AI-Powered Event Discovery</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mb-8 text-6xl font-black leading-[0.92] tracking-tight md:text-7xl lg:text-8xl xl:text-9xl"
            >
              Discover
              <br />
              Events
              <br />
              <span className="bg-linear-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                That Move
              </span>
              <br />
              <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                You
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-zinc-400 lg:mx-0"
            >
              Experience concerts, workshops, tournaments, comedy nights, and
              unforgettable moments powered by intelligent AI recommendations.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link to="/events">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-linear-to-r from-violet-600 via-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-500/25 w-full sm:w-auto"
                >
                  Explore Events
                </motion.button>
              </Link>

              <Link to={createEventPath}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl transition-all hover:border-cyan-400/40 hover:bg-cyan-500/10 w-full sm:w-auto"
                >
                  Host Event
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* RIGHT — dual vertical scrolling columns */}
          <motion.div
            className="flex-1 hidden lg:flex justify-end items-center gap-4"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          >
            {/* Column 1 scrolls UP */}
            <VerticalMarquee cards={DEMO_CARDS_COL_1} direction="up" duration={26} />
            {/* Column 2 scrolls DOWN — opposite direction for depth */}
            <VerticalMarquee cards={DEMO_CARDS_COL_2} direction="down" duration={20} />
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.h2
            className="mb-16 text-center text-4xl font-black tracking-tight md:text-6xl"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            How It Works
          </motion.h2>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {[
              {
                num: "01",
                title: "Browse Events",
                desc: "Discover curated events tailored to your interests — locally or online.",
              },
              {
                num: "02",
                title: "Book Tickets",
                desc: "Reserve your seat instantly with a seamless, secure booking flow.",
              },
              {
                num: "03",
                title: "Enjoy Experience",
                desc: "Attend and enjoy unforgettable real-world moments with the people you love.",
              },
            ].map((step) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                whileHover={{ y: -10 }}
                className="group rounded-4xl border border-white/10 bg-white/5 p-8 backdrop-blur-2xl transition-all duration-500 hover:border-cyan-400/30"
              >
                <span className="text-6xl font-black text-white/10">{step.num}</span>
                <h3 className="mt-5 text-2xl font-bold text-white">{step.title}</h3>
                <p className="mt-4 leading-relaxed text-zinc-400">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TRENDING EVENTS ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex justify-between items-end mb-10"
          >
            <div>
              <h2 className="text-3xl font-black text-white mb-2">Trending Near You</h2>
              <p className="text-zinc-400">Grab your tickets before they sell out.</p>
            </div>
            <Link to="/events" className="hidden sm:block text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              View all →
            </Link>
          </motion.div>

          {isLoading ? (
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-12 text-center text-zinc-400">
              Loading events...
            </div>
          ) : events.length > 0 ? (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event) => (
                <motion.div key={event._id} variants={fadeUp}>
                  <EventCard event={event} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-[20px] border border-white/10 bg-white/5 p-12 text-center text-zinc-400">
              No published events yet.
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link to="/events" className="text-cyan-400 font-semibold hover:text-cyan-300">
              View all Events →
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI CHAT ───────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative flex flex-col items-center gap-12 overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl md:flex-row md:p-14"
          >
            <div className="absolute inset-0 bg-linear-to-r from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />

            <div className="relative z-10 flex-1">
              <h2 className="mb-5 text-4xl font-black leading-tight md:text-5xl">
                Ask Nexora AI
                <br />
                <span className="bg-linear-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Anything
                </span>
              </h2>
              <p className="mb-8 max-w-xl text-lg text-zinc-400">
                Find events, get smart recommendations, and discover experiences through natural AI conversation.
              </p>
              <Link to="/ai-chat">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-linear-to-r from-violet-600 via-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-500/20"
                >
                  Try AI Chat
                </motion.button>
              </Link>
            </div>

            <div className="relative z-10 w-full max-w-md rounded-4xl border border-white/10 bg-black/30 p-5 backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-zinc-400 font-medium">Nexora AI</span>
              </div>
              {chatMessages.map((msg) => (
                <div key={msg._id} className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-linear-to-r from-violet-600 to-cyan-500 text-white"
                      : "bg-white/10 text-zinc-300"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-zinc-500">
                Ask AI about events...
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
