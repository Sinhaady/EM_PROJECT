import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Target, Lightbulb, Globe } from "lucide-react";
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
  visible: { transition: { staggerChildren: 0.12 } },
};

const TEAM = [
  {
    name: "Aditya",
    role: "Founder & Full-Stack Engineer",
    bio: "Built FUNDO from scratch — backend, frontend, and everything in between. Loves clean code and meaningful products.",
    gradient: "from-violet-500/20 to-blue-600/20",
    border: "hover:border-violet-400/40",
    initials: "A",
    accent: "bg-gradient-to-br from-violet-500 to-blue-600",
    links: {
      github: "#",
      linkedin: "#",
    },
  },
  {
    name: "Nexora AI",
    role: "AI Co-Pilot",
    bio: "The intelligence layer behind FUNDO. Recommends events, answers questions, and makes the whole experience feel magical.",
    gradient: "from-cyan-500/20 to-teal-600/20",
    border: "hover:border-cyan-400/40",
    initials: "N",
    accent: "bg-gradient-to-br from-cyan-500 to-teal-600",
    links: {
      github: "#",
      linkedin: "#",
    },
  },
];

const VALUES = [
  {
    icon: Heart,
    title: "People First",
    desc: "Every feature we build starts with one question: does this make someone's experience better?",
    color: "text-rose-400",
    bg: "from-rose-500/20 to-pink-600/20",
  },
  {
    icon: Target,
    title: "Radical Simplicity",
    desc: "We remove friction at every step. Booking a ticket should be as easy as clicking a button.",
    color: "text-amber-400",
    bg: "from-amber-500/20 to-orange-600/20",
  },
  {
    icon: Lightbulb,
    title: "Always Innovating",
    desc: "AI, real-time updates, smart notifications — we bring modern technology to event experiences.",
    color: "text-cyan-400",
    bg: "from-cyan-500/20 to-blue-600/20",
  },
  {
    icon: Globe,
    title: "Built for Everyone",
    desc: "Whether you're organizing a cricket match or a startup summit — FUNDO works for you.",
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-teal-600/20",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative flex flex-col items-center justify-center text-center pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-violet-600/15 blur-3xl rounded-full" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-cyan-500/15 blur-3xl rounded-full" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:28px_28px]" />
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 mb-4 text-sm font-semibold tracking-widest uppercase text-cyan-400"
        >
          Our Story
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="relative z-10 text-5xl md:text-7xl font-black tracking-tight leading-[0.95] mb-6"
        >
          We believe events
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            change lives
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 max-w-2xl text-lg text-zinc-400 leading-relaxed"
        >
          FUNDO was born from a simple frustration: finding and managing events
          was unnecessarily hard. We set out to fix that — with great design,
          smart AI, and a lot of care.
        </motion.p>
      </section>

      {/* ── MISSION ── */}
      <section className="py-20 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-5xl relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-10 md:p-16 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest uppercase text-violet-400 mb-4">
                Our Mission
              </p>
              <h2 className="text-3xl md:text-4xl font-black leading-tight mb-5">
                Make every event worth
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  {" "}
                  showing up for
                </span>
              </h2>
              <p className="text-zinc-400 leading-relaxed text-base">
                We're building infrastructure for human connection — the
                technology behind concerts, hackathons, cultural fests, and
                everything in between. Our goal is to remove every barrier
                between a great idea and a great event.
              </p>
            </div>
            <div className="flex-shrink-0 grid grid-cols-2 gap-4 text-center">
              {[
                { v: "50K+", l: "Events" },
                { v: "2M+", l: "Attendees" },
                { v: "120+", l: "Cities" },
                { v: "98%", l: "Satisfaction" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <p className="text-3xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {s.v}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── VALUES ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-3xl md:text-5xl font-black mb-4"
          >
            What we stand for
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-zinc-400 mb-14 max-w-md mx-auto"
          >
            Four principles that guide every decision we make.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {VALUES.map((v) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  variants={fadeUp}
                  whileHover={{ y: -5 }}
                  className={`flex gap-6 items-start rounded-[28px] border border-white/10 bg-gradient-to-br ${v.bg} p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/20`}
                >
                  <div
                    className={`mt-1 flex-shrink-0 h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center ${v.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {v.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-3xl md:text-5xl font-black mb-4"
          >
            The team
          </motion.h2>
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center text-zinc-400 mb-14 max-w-md mx-auto"
          >
            Small team, big ambition. Built with passion and a lot of caffeine.
          </motion.p>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {TEAM.map((member) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className={`rounded-[32px] border border-white/10 bg-gradient-to-br ${member.gradient} p-8 backdrop-blur-xl transition-all duration-300 ${member.border}`}
              >
                {/* Avatar */}
                <div
                  className={`h-16 w-16 rounded-2xl ${member.accent} flex items-center justify-center text-2xl font-black text-white shadow-xl mb-6`}
                >
                  {member.initials}
                </div>
                <h3 className="text-xl font-black text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-cyan-400 mb-4">
                  {member.role}
                </p>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  {member.bio}
                </p>

                {/* Social links */}
                <div className="mt-4 text-sm text-zinc-500">
                  Connect with us soon.
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-12 md:p-16 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[350px] h-[180px] bg-violet-600/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-5">
              Join the{" "}
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                FUNDO family
              </span>
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-sm mx-auto">
              Whether you attend or organize — there's a place for you here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 px-8 py-4 font-semibold text-white shadow-xl shadow-violet-500/25 w-full sm:w-auto"
                >
                  Create an Account
                </motion.button>
              </Link>
              <Link to="/features">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-xl hover:border-cyan-400/40 hover:bg-cyan-500/10 transition-all w-full sm:w-auto"
                >
                  See Features
                </motion.button>
              </Link>
            </div>
          </div>{" "}
        </motion.div>
      </section>
    </div>
  );
}
