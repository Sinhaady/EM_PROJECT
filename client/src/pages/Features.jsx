import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Zap, Shield, Bell, Map, Ticket,
  BarChart3, Globe, MessageSquare, Calendar, Users, CreditCard,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Discovery",
    desc: "Nexora AI learns your taste and surfaces events you'll actually love — before you even search for them.",
    gradient: "from-violet-500/20 to-purple-600/20",
    border: "hover:border-violet-400/40",
    accent: "text-violet-400",
    glow: "shadow-violet-500/20",
  },
  {
    icon: Ticket,
    title: "Instant Booking",
    desc: "Reserve your spot in seconds. No redirects, no third-party friction — end-to-end ticketing built in.",
    gradient: "from-cyan-500/20 to-blue-600/20",
    border: "hover:border-cyan-400/40",
    accent: "text-cyan-400",
    glow: "shadow-cyan-500/20",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "Get reminders, updates and cancellations right in your inbox — automated and beautifully formatted.",
    gradient: "from-emerald-500/20 to-teal-600/20",
    border: "hover:border-emerald-400/40",
    accent: "text-emerald-400",
    glow: "shadow-emerald-500/20",
  },
  {
    icon: BarChart3,
    title: "Organiser Analytics",
    desc: "Track registrations, revenue, and attendee demographics in real time from your event dashboard.",
    gradient: "from-orange-500/20 to-amber-600/20",
    border: "hover:border-orange-400/40",
    accent: "text-orange-400",
    glow: "shadow-orange-500/20",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    desc: "Every transaction is encrypted end-to-end. Attendees pay with confidence, organizers get paid fast.",
    gradient: "from-rose-500/20 to-pink-600/20",
    border: "hover:border-rose-400/40",
    accent: "text-rose-400",
    glow: "shadow-rose-500/20",
  },
  {
    icon: Map,
    title: "Location-Aware Events",
    desc: "Discover what's happening near you with geo-based filtering and interactive map views.",
    gradient: "from-blue-500/20 to-indigo-600/20",
    border: "hover:border-blue-400/40",
    accent: "text-blue-400",
    glow: "shadow-blue-500/20",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Add co-organizers, assign roles, and manage your entire team from a single collaborative workspace.",
    gradient: "from-yellow-500/20 to-lime-600/20",
    border: "hover:border-yellow-400/40",
    accent: "text-yellow-400",
    glow: "shadow-yellow-500/20",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    desc: "Ask Nexora anything — 'find me a jazz event this Saturday' — and get curated results instantly.",
    gradient: "from-fuchsia-500/20 to-violet-600/20",
    border: "hover:border-fuchsia-400/40",
    accent: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/20",
  },
  {
    icon: Calendar,
    title: "Event Scheduling",
    desc: "Create one-time or recurring events with flexible scheduling, capacity limits, and waitlists.",
    gradient: "from-teal-500/20 to-cyan-600/20",
    border: "hover:border-teal-400/40",
    accent: "text-teal-400",
    glow: "shadow-teal-500/20",
  },
];

const STATS = [
  { value: "50K+", label: "Events Hosted" },
  { value: "2M+",  label: "Tickets Sold" },
  { value: "98%",  label: "Satisfaction Rate" },
  { value: "120+", label: "Cities Covered" },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center pt-36 pb-24 px-6 overflow-hidden">
        {/* Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-violet-600/15 blur-3xl rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-xl"
        >
          <Zap className="h-4 w-4 text-cyan-400" />
          <span className="text-sm text-zinc-300">Everything you need, nothing you don't</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative z-10 text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
        >
          Features built for
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            real experiences
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 max-w-xl text-lg text-zinc-400 leading-relaxed mb-10"
        >
          From AI-powered discovery to seamless ticketing and analytics —
          FUNDO gives organizers and attendees everything in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-500/25"
            >
              Get Started Free
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="py-12 px-6 border-y border-white/5">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
        >
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}>
              <p className="text-4xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-zinc-400">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-28 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-3xl md:text-5xl font-black mb-4"
          >
            Everything in one platform
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-zinc-400 mb-16 max-w-lg mx-auto"
          >
            Nine powerful features, one cohesive product — designed to make every event memorable.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  variants={fadeUp}
                  whileHover={{ y: -6 }}
                  className={`group relative rounded-[28px] border border-white/10 bg-gradient-to-br ${f.gradient} p-7 backdrop-blur-xl transition-all duration-400 ${f.border} cursor-default`}
                >
                  <div className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ${f.accent} shadow-lg ${f.glow}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-4xl relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-12 md:p-16 text-center backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-violet-600/20 blur-3xl rounded-full" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-5 leading-tight">
              Ready to host your
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                next great event?
              </span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md mx-auto">
              Join thousands of organizers already using FUNDO to create unforgettable experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-500/25 w-full sm:w-auto"
                >
                  Start for Free
                </motion.button>
              </Link>
              <Link to="/events">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all w-full sm:w-auto"
                >
                  Browse Events
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}