import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Ticket, BarChart3, User, Calendar,
  MapPin, Clock, ChevronRight, LogOut, Settings,
  TrendingUp, Star, Bell, Search, Menu, X,
  CheckCircle, XCircle, AlertCircle, Download, ExternalLink,
} from "lucide-react";

// ── Animation variants ─────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const isUpcoming = (d) => new Date(d) > new Date();
const isPast = (d) => new Date(d) <= new Date();

// ── Category accent colours ────────────────────────────────────────────────────
const CAT_COLORS = {
  SPORTS:  { bg: "bg-cyan-500/15",    text: "text-cyan-400",    border: "border-cyan-500/30"   },
  MUSIC:   { bg: "bg-violet-500/15",  text: "text-violet-400",  border: "border-violet-500/30" },
  TECH:    { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30"},
  COMEDY:  { bg: "bg-yellow-500/15",  text: "text-yellow-400",  border: "border-yellow-500/30" },
  ART:     { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-pink-500/30"   },
  FOOD:    { bg: "bg-orange-500/15",  text: "text-orange-400",  border: "border-orange-500/30" },
  DEFAULT: { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/30"   },
};
const cat = (c) => CAT_COLORS[c?.toUpperCase()] || CAT_COLORS.DEFAULT;

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  { id: "overview", label: "Overview",  icon: LayoutDashboard },
  { id: "events",   label: "My Events", icon: Calendar },
  { id: "tickets",  label: "Tickets",   icon: Ticket },
  { id: "stats",    label: "Stats",     icon: BarChart3 },
  { id: "profile",  label: "Profile",   icon: User },
];

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, gradient, icon: Icon }) => (
  <motion.div
    variants={fadeUp}
    className={`relative overflow-hidden rounded-[22px] border border-white/10 bg-linear-to-br ${gradient} p-6 backdrop-blur-xl`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-white/80" />
      </div>
    </div>
    <p className="text-3xl font-black text-white mb-1">{value}</p>
    <p className="text-sm font-semibold text-white/80">{label}</p>
    {sub && <p className="text-xs text-white/50 mt-1">{sub}</p>}
  </motion.div>
);

// ── Event row card ─────────────────────────────────────────────────────────────
const EventRow = ({ event, onLeave }) => {
  const colors = cat(event.category);
  const upcoming = isUpcoming(event.date);
  return (
    <motion.div
      variants={fadeUp}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-[20px] border border-white/8 bg-white/4 hover:bg-white/7 hover:border-white/15 p-5 transition-all duration-300 backdrop-blur-xl"
    >
      {/* Image / placeholder */}
      <div className="shrink-0 h-16 w-16 rounded-2xl overflow-hidden bg-white/10">
        {event.image ? (
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className={`h-full w-full flex items-center justify-center ${colors.bg}`}>
            <Calendar className={`h-7 w-7 ${colors.text}`} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            {event.category || "Event"}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${upcoming ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/20 text-zinc-400"}`}>
            {upcoming ? "Upcoming" : "Past"}
          </span>
        </div>
        <h3 className="font-bold text-white text-sm truncate">{event.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500 flex-wrap">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{fmtDate(event.date)} · {fmtTime(event.date)}</span>
          {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link to={`/events/${event._id}`}>
          <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/25 transition-all">
            <ExternalLink className="h-4 w-4" />
          </button>
        </Link>
        {upcoming && (
          <button
            onClick={() => onLeave(event._id)}
            className="h-9 px-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", bio: "", phone: "" });
  const [saveStatus, setSaveStatus] = useState(null); // "saving" | "saved" | "error"

  useEffect(() => {
    fetchJoined();
  }, []);

  const fetchJoined = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me/events");           // adjust endpoint to yours
      setJoinedEvents(res.data.events || []);
    } catch {
      // fallback: empty array — UI handles it gracefully
      setJoinedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/leave`);
      setJoinedEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err) {
      console.error("Leave failed", err);
    }
  };

  const handleSaveProfile = async () => {
    setSaveStatus("saving");
    try {
      await api.patch("/users/me", profileForm);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(null), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 2500);
    }
  };

  const handleLogout = () => { logout(); navigate("/"); };

  // Derived stats
  const upcoming = joinedEvents.filter((e) => isUpcoming(e.date));
  const past      = joinedEvents.filter((e) => isPast(e.date));
  const cats      = [...new Set(joinedEvents.map((e) => e.category).filter(Boolean))];

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }) => (
    <aside className={`flex flex-col h-full ${mobile ? "" : "w-64"}`}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-linear-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-black text-white">F</span>
          </div>
          <span className="text-lg font-black text-white">FUNDO</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {NAV.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-linear-to-r from-violet-600/30 to-cyan-500/20 text-white border border-violet-500/30"
                  : "text-zinc-400 hover:text-white hover:bg-white/6"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-cyan-400" : ""}`} />
              {label}
              {active && <ChevronRight className="h-3 w-3 ml-auto text-cyan-400" />}
            </button>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-5 border-t border-white/8">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-9 w-9 rounded-xl bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-black text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );

  // ── Tab: Overview ──────────────────────────────────────────────────────────
  const OverviewTab = () => (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
      {/* Greeting */}
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black text-white mb-1">
          Hey, {user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-zinc-400">Here's what's happening with your events.</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Joined"   value={joinedEvents.length} sub="all time"          gradient="from-violet-500/25 to-purple-600/15" icon={Calendar}    />
        <StatCard label="Upcoming"       value={upcoming.length}     sub="don't miss these"  gradient="from-cyan-500/25 to-blue-600/15"    icon={TrendingUp}  />
        <StatCard label="Attended"       value={past.length}         sub="events completed"  gradient="from-emerald-500/25 to-teal-600/15" icon={CheckCircle} />
        <StatCard label="Categories"     value={cats.length}         sub="interests explored" gradient="from-orange-500/25 to-amber-600/15" icon={Star}        />
      </motion.div>

      {/* Upcoming events preview */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">Upcoming Events</h2>
          <button onClick={() => setActiveTab("events")} className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            View all →
          </button>
        </div>
        {loading ? (
          <div className="rounded-[20px] border border-white/8 bg-white/4 p-10 text-center text-zinc-500 text-sm">Loading...</div>
        ) : upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((e) => <EventRow key={e._id} event={e} onLeave={handleLeave} />)}
          </div>
        ) : (
          <div className="rounded-[20px] border border-white/8 bg-white/4 p-10 text-center">
            <Calendar className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm font-semibold">No upcoming events</p>
            <Link to="/events" className="mt-3 inline-block text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">Browse events →</Link>
          </div>
        )}
      </motion.div>

      {/* Categories explored */}
      {cats.length > 0 && (
        <motion.div variants={fadeUp}>
          <h2 className="text-lg font-black text-white mb-4">Your Interests</h2>
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => {
              const colors = cat(c);
              return (
                <span key={c} className={`px-4 py-2 rounded-full border text-xs font-bold tracking-widest uppercase ${colors.bg} ${colors.text} ${colors.border}`}>
                  {c}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );

  // ── Tab: My Events ─────────────────────────────────────────────────────────
  const EventsTab = () => {
    const [filter, setFilter] = useState("all");
    const filtered = joinedEvents.filter((e) => {
      if (filter === "upcoming") return isUpcoming(e.date);
      if (filter === "past")     return isPast(e.date);
      return true;
    });

    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">My Events</h1>
            <p className="text-zinc-400 text-sm">{joinedEvents.length} events joined</p>
          </div>
          <Link to="/events">
            <button className="rounded-2xl bg-linear-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:scale-105 transition-transform">
              + Find Events
            </button>
          </Link>
        </motion.div>

        {/* Filter pills */}
        <motion.div variants={fadeUp} className="flex gap-2">
          {["all", "upcoming", "past"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f
                  ? "bg-linear-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                  : "border border-white/10 bg-white/5 text-zinc-400 hover:text-white"
              }`}
            >
              {f}
            </button>
          ))}
        </motion.div>

        {/* List */}
        {loading ? (
          <div className="rounded-[20px] border border-white/8 bg-white/4 p-12 text-center text-zinc-500 text-sm">Loading events...</div>
        ) : filtered.length > 0 ? (
          <motion.div variants={stagger} className="space-y-3">
            {filtered.map((e) => <EventRow key={e._id} event={e} onLeave={handleLeave} />)}
          </motion.div>
        ) : (
          <div className="rounded-[20px] border border-white/8 bg-white/4 p-12 text-center">
            <Calendar className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-300 font-semibold mb-1">No {filter !== "all" ? filter : ""} events found</p>
            <p className="text-zinc-500 text-sm">
              {filter === "upcoming" ? "Join some upcoming events to see them here." : "You haven't joined any events yet."}
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  // ── Tab: Tickets ───────────────────────────────────────────────────────────
  const TicketsTab = () => (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black text-white">Tickets</h1>
        <p className="text-zinc-400 text-sm">Your confirmed event registrations</p>
      </motion.div>

      {loading ? (
        <div className="rounded-[20px] border border-white/8 bg-white/4 p-12 text-center text-zinc-500 text-sm">Loading tickets...</div>
      ) : joinedEvents.length > 0 ? (
        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {joinedEvents.map((event) => {
            const colors = cat(event.category);
            const upcoming = isUpcoming(event.date);
            return (
              <motion.div
                key={event._id}
                variants={fadeUp}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/4 backdrop-blur-xl"
              >
                {/* Ticket top */}
                <div className={`h-2 w-full bg-linear-to-r ${upcoming ? "from-violet-600 to-cyan-500" : "from-zinc-600 to-zinc-500"}`} />

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
                        {event.category || "Event"}
                      </span>
                      <h3 className="text-base font-black text-white mt-2 leading-snug">{event.title}</h3>
                    </div>
                    <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${upcoming ? "bg-emerald-500/20" : "bg-zinc-500/20"}`}>
                      {upcoming ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Clock className="h-5 w-5 text-zinc-400" />}
                    </div>
                  </div>

                  {/* Dashed divider */}
                  <div className="border-t border-dashed border-white/10 my-4" />

                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400">
                    <div>
                      <p className="text-zinc-600 mb-0.5 text-[10px] uppercase tracking-wider">Date</p>
                      <p className="text-zinc-300 font-semibold">{fmtDate(event.date)}</p>
                    </div>
                    <div>
                      <p className="text-zinc-600 mb-0.5 text-[10px] uppercase tracking-wider">Time</p>
                      <p className="text-zinc-300 font-semibold">{fmtTime(event.date)}</p>
                    </div>
                    {event.location && (
                      <div className="col-span-2">
                        <p className="text-zinc-600 mb-0.5 text-[10px] uppercase tracking-wider">Location</p>
                        <p className="text-zinc-300 font-semibold">{event.location}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Link to={`/events/${event._id}`} className="flex-1">
                      <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" /> View Event
                      </button>
                    </Link>
                    <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-zinc-400 hover:text-white hover:border-white/20 transition-all">
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div className="rounded-[20px] border border-white/8 bg-white/4 p-16 text-center">
          <Ticket className="h-14 w-14 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-300 font-semibold mb-2">No tickets yet</p>
          <p className="text-zinc-500 text-sm mb-5">Browse events and register to see your tickets here.</p>
          <Link to="/events">
            <button className="rounded-2xl bg-linear-to-r from-violet-600 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg">
              Browse Events
            </button>
          </Link>
        </div>
      )}
    </motion.div>
  );

  // ── Tab: Stats ─────────────────────────────────────────────────────────────
  const StatsTab = () => {
    const byCategory = joinedEvents.reduce((acc, e) => {
      const k = e.category || "Other";
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    const total = joinedEvents.length || 1;
    const monthlyMap = joinedEvents.reduce((acc, e) => {
      const m = new Date(e.date).toLocaleString("en-IN", { month: "short" });
      acc[m] = (acc[m] || 0) + 1;
      return acc;
    }, {});
    const months = Object.entries(monthlyMap);
    const maxMonth = Math.max(...months.map(([, v]) => v), 1);

    return (
      <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={fadeUp}>
          <h1 className="text-3xl font-black text-white">Stats</h1>
          <p className="text-zinc-400 text-sm">Your event activity at a glance</p>
        </motion.div>

        {/* Summary cards */}
        <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Joined"  value={joinedEvents.length} sub="all time"         gradient="from-violet-500/25 to-purple-600/15" icon={Calendar}    />
          <StatCard label="Upcoming"      value={upcoming.length}     sub="registered"       gradient="from-cyan-500/25 to-blue-600/15"    icon={TrendingUp}  />
          <StatCard label="Completed"     value={past.length}         sub="events attended"  gradient="from-emerald-500/25 to-teal-600/15" icon={CheckCircle} />
          <StatCard label="Interests"     value={cats.length}         sub="categories"       gradient="from-orange-500/25 to-amber-600/15" icon={Star}        />
        </motion.div>

        {/* Category breakdown */}
        <motion.div variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/4 p-7 backdrop-blur-xl">
          <h2 className="text-base font-black text-white mb-6">Events by Category</h2>
          {Object.keys(byCategory).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(byCategory).sort(([, a], [, b]) => b - a).map(([c, count]) => {
                const colors = cat(c);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={c}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{c}</span>
                      <span className="text-xs text-zinc-400">{count} event{count > 1 ? "s" : ""} · {pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        className={`h-full rounded-full bg-linear-to-r ${
                          colors.text === "text-cyan-400"    ? "from-cyan-500 to-blue-500"     :
                          colors.text === "text-violet-400"  ? "from-violet-500 to-purple-500" :
                          colors.text === "text-emerald-400" ? "from-emerald-500 to-teal-500"  :
                          colors.text === "text-yellow-400"  ? "from-yellow-500 to-amber-500"  :
                          "from-blue-500 to-indigo-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-6">No data yet — join some events!</p>
          )}
        </motion.div>

        {/* Monthly bar chart */}
        {months.length > 0 && (
          <motion.div variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/4 p-7 backdrop-blur-xl">
            <h2 className="text-base font-black text-white mb-6">Monthly Activity</h2>
            <div className="flex items-end gap-3 h-32">
              {months.map(([month, count]) => (
                <div key={month} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-zinc-400 font-semibold">{count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(count / maxMonth) * 100}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="w-full rounded-t-lg bg-linear-to-t from-violet-600 to-cyan-500 min-h-1"
                    style={{ maxHeight: "100%" }}
                  />
                  <span className="text-[10px] text-zinc-500">{month}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  // ── Tab: Profile ───────────────────────────────────────────────────────────
  const ProfileTab = () => (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-2xl">
      <motion.div variants={fadeUp}>
        <h1 className="text-3xl font-black text-white">Profile</h1>
        <p className="text-zinc-400 text-sm">Manage your account information</p>
      </motion.div>

      {/* Avatar card */}
      <motion.div variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/4 p-7 backdrop-blur-xl flex items-center gap-6">
        <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white shrink-0">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <div>
          <h2 className="text-xl font-black text-white">{user?.name}</h2>
          <p className="text-zinc-400 text-sm">{user?.email}</p>
          <span className="mt-2 inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
            Attendee
          </span>
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/4 p-7 backdrop-blur-xl space-y-5">
        <h3 className="text-base font-black text-white">Edit Information</h3>

        {[
          { label: "Full Name",    key: "name",  type: "text",  placeholder: "Your full name"  },
          { label: "Phone",        key: "phone", type: "tel",   placeholder: "+91 XXXXX XXXXX" },
          { label: "Bio",          key: "bio",   type: "textarea", placeholder: "Tell us about yourself..." },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{label}</label>
            {type === "textarea" ? (
              <textarea
                rows={3}
                value={profileForm[key]}
                onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all resize-none"
              />
            ) : (
              <input
                type={type}
                value={profileForm[key]}
                onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 focus:bg-white/8 transition-all"
              />
            )}
          </div>
        ))}

        {/* Email (readonly) */}
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-zinc-500 cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saveStatus === "saving"}
          className="w-full rounded-2xl bg-linear-to-r from-violet-600 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.01] active:scale-[0.99] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "✓ Saved!" : saveStatus === "error" ? "Error — try again" : "Save Changes"}
        </button>
      </motion.div>

      {/* Danger zone */}
      <motion.div variants={fadeUp} className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-7">
        <h3 className="text-base font-black text-white mb-1">Danger Zone</h3>
        <p className="text-zinc-400 text-sm mb-5">These actions are irreversible. Proceed with caution.</p>
        <button
          onClick={handleLogout}
          className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sign Out of Account
        </button>
      </motion.div>
    </motion.div>
  );

  // ── Tab router ─────────────────────────────────────────────────────────────
  const TABS = { overview: OverviewTab, events: EventsTab, tickets: TicketsTab, stats: StatsTab, profile: ProfileTab };
  const ActiveTab = TABS[activeTab] || OverviewTab;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col w-64 border-r border-white/8 bg-white/2 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 bg-[#0a0d16] border-r border-white/10 flex flex-col lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-xl bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/8 bg-white/2 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-sm font-black text-white capitalize">{activeTab}</h2>
              <p className="text-xs text-zinc-500 hidden sm:block">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/events">
              <button className="hidden sm:flex items-center gap-2 h-9 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-white/20 transition-all">
                <Search className="h-3.5 w-3.5" /> Browse Events
              </button>
            </Link>
            <button className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-all relative">
              <Bell className="h-4 w-4" />
              {upcoming.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-linear-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-[9px] font-black">
                  {upcoming.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                <ActiveTab />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}