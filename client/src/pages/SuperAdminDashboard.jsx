import {
  AlertTriangle,
  Bell,
  CalendarCheck,
  Check,
  ChevronRight,
  Crown,
  Flag,
  History,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Megaphone,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const SUPER_ADMIN_EMAIL = 'adityasinha296@gmail.com';

const navGroups = [
  {
    label: 'Overview',
    items: [{ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Manage',
    items: [
      { id: 'users', label: 'User management', icon: Users },
      { id: 'moderation', label: 'Event moderation', icon: CalendarCheck, badgeKey: 'pending' },
      { id: 'reports', label: 'Reports & flags', icon: Flag, badgeKey: 'flags' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'revenue', label: 'Revenue', icon: IndianRupee },
      { id: 'refunds', label: 'Refunds', icon: RotateCcw },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'audit', label: 'Audit log', icon: History },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'TBA';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const StatCard = ({ label, value, sub, icon: Icon, tone = 'text-cyan-300' }) => (
  <div className="rounded-lg border border-white/10 bg-[#171717] p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-black text-white">{value}</p>
      </div>
      <Icon className={`h-5 w-5 ${tone}`} />
    </div>
    {sub && <p className={`mt-2 text-xs font-bold ${tone}`}>{sub}</p>}
  </div>
);

const HealthBar = ({ label, value, color }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs font-bold">
      <span className="text-zinc-300">{label}</span>
      <span className="text-zinc-300">{value}</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-black/40">
      <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
    </div>
  </div>
);

const EmptyState = ({ children }) => (
  <div className="rounded-lg border border-white/10 bg-[#171717] p-8 text-center text-sm text-zinc-500">
    {children}
  </div>
);

const SuperAdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingEvents, setPendingEvents] = useState([]);
  const [publishedEvents, setPublishedEvents] = useState([]);
  const [rejectedEvents, setRejectedEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ users: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [busyEventId, setBusyEventId] = useState(null);

  const isSuperAdmin =
    user?.role === 'super_admin' &&
    user?.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

  const loadDashboard = async () => {
    setIsLoading(true);

    try {
      const [pendingResponse, publishedResponse, rejectedResponse, usersResponse, transactionsResponse] =
        await Promise.all([
          api.get('/events/moderation', { params: { status: 'PENDING' } }),
          api.get('/events'),
          api.get('/events/moderation', { params: { status: 'REJECTED' } }),
          api.get('/users', { params: { limit: 8 } }),
          api.get('/transactions'),
        ]);

      setPendingEvents(pendingResponse.data.events || []);
      setPublishedEvents(publishedResponse.data.events || []);
      setRejectedEvents(rejectedResponse.data.events || []);
      setUsers(usersResponse.data.users || []);
      setTransactions(transactionsResponse.data.transactions || []);
      setTotals({
        users: usersResponse.data.total || 0,
        revenue: transactionsResponse.data.platformGrossRevenue || 0,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadDashboard();
    }
  }, [isSuperAdmin]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handleModerate = async (eventId, status) => {
    setBusyEventId(eventId);

    try {
      const response = await api.patch(`/events/${eventId}/moderation`, { status });
      setPendingEvents((current) => current.filter((event) => event._id !== eventId));

      if (status === 'PUBLISHED') {
        setPublishedEvents((current) => [response.data.event, ...current]);
      } else {
        setRejectedEvents((current) => [response.data.event, ...current]);
      }

      toast.success(status === 'PUBLISHED' ? 'Event approved.' : 'Event rejected.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update event.');
    } finally {
      setBusyEventId(null);
    }
  };

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return publishedEvents.filter((event) => new Date(event.date) >= now);
  }, [publishedEvents]);

  const flagCount = 7;
  const refundCount = 3;
  const approvalRate =
    publishedEvents.length + rejectedEvents.length > 0
      ? Math.round((publishedEvents.length / (publishedEvents.length + rejectedEvents.length)) * 100)
      : 88;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdmin) {
    return <Navigate to="/" replace />;
  }

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={totals.users} sub="fixed admin protected" />
        <StatCard icon={CalendarCheck} label="Active events" value={upcomingEvents.length} sub={`${publishedEvents.length} published`} tone="text-emerald-300" />
        <StatCard icon={IndianRupee} label="Revenue" value={formatCurrency(totals.revenue)} sub="gross confirmed sales" tone="text-amber-300" />
        <StatCard icon={Flag} label="Open flags" value={flagCount} sub="action needed" tone="text-red-300" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-lg border border-white/10 bg-[#171717] p-5">
          <h2 className="text-base font-black text-white">Quick actions</h2>
          <div className="mt-4 grid gap-3">
            {[
              { label: `Review ${pendingEvents.length} pending events`, tab: 'moderation' },
              { label: `Handle ${flagCount} open reports`, tab: 'reports' },
              { label: 'Process refund requests', tab: 'refunds' },
              { label: 'Send announcement', tab: 'announcements' },
            ].map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => setActiveTab(action.tab)}
                className="flex items-center justify-between rounded-lg border border-white/15 bg-black/10 px-4 py-3 text-left text-sm font-black text-white hover:bg-white/[0.05]"
              >
                {action.label}
                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-[#171717] p-5">
          <h2 className="text-base font-black text-white">Platform health</h2>
          <div className="mt-4 space-y-4">
            <HealthBar label="Payment success rate" value="94%" color="bg-emerald-500" />
            <HealthBar label="Event approval rate" value={`${approvalRate}%`} color="bg-blue-500" />
            <HealthBar label="Refund rate" value="3%" color="bg-red-400" />
            <HealthBar label="User ban rate" value="0.2%" color="bg-red-400" />
          </div>
        </section>
      </div>
    </div>
  );

  const renderModeration = () => (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">Event moderation</h2>
          <p className="text-sm text-zinc-500">{pendingEvents.length} organizer submission{pendingEvents.length === 1 ? '' : 's'} waiting</p>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-bold text-white hover:bg-white/[0.08]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <EmptyState>Loading moderation queue...</EmptyState>
      ) : pendingEvents.length === 0 ? (
        <EmptyState>No pending events right now.</EmptyState>
      ) : (
        <div className="grid gap-4">
          {pendingEvents.map((event) => (
            <article key={event._id} className="grid gap-4 rounded-lg border border-white/10 bg-[#171717] p-4 lg:grid-cols-[160px_1fr_auto]">
              <div className="aspect-video overflow-hidden rounded-md bg-zinc-900 lg:aspect-square">
                <img src={event.image?.url} alt={event.title} className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold uppercase text-amber-200">Pending</span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold uppercase text-zinc-300">{event.category}</span>
                </div>
                <h3 className="mt-3 text-lg font-black text-white">{event.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-400">{event.description}</p>
                <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                  <span>{formatDate(event.date)}</span>
                  <span>{event.location}</span>
                  <span>By {event.createdBy?.name || 'Organizer'}</span>
                  <span>{event.price === 0 ? 'Free' : formatCurrency(event.price)}</span>
                </div>
              </div>

              <div className="flex gap-2 lg:flex-col lg:justify-center">
                <button
                  type="button"
                  onClick={() => handleModerate(event._id, 'PUBLISHED')}
                  disabled={busyEventId === event._id}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleModerate(event._id, 'REJECTED')}
                  disabled={busyEventId === event._id}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 lg:flex-none"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );

  const renderUsers = () => (
    <section className="rounded-lg border border-white/10 bg-[#171717]">
      <div className="flex flex-col gap-3 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-black text-white">User management</h2>
          <p className="text-sm text-zinc-500">{totals.users} registered users</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-400">
          <Search className="h-4 w-4" />
          Search users
        </div>
      </div>

      <div className="divide-y divide-white/10">
        {users.map((account) => (
          <div key={account._id} className="grid gap-3 p-4 text-sm sm:grid-cols-[1.2fr_1fr_120px] sm:items-center">
            <div>
              <p className="font-bold text-white">{account.name}</p>
              <p className="text-zinc-500">{account.email}</p>
            </div>
            <p className="text-zinc-400">{account.role}</p>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-center text-xs font-bold text-emerald-300">Active</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderSimplePanel = (title, description, rows) => (
    <section className="rounded-lg border border-white/10 bg-[#171717] p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      <div className="mt-5 grid gap-3">
        {rows.map((row) => (
          <div key={row.title} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-4">
            <div>
              <p className="font-bold text-white">{row.title}</p>
              <p className="mt-1 text-sm text-zinc-500">{row.meta}</p>
            </div>
            <span className={row.tone || 'text-sm font-black text-cyan-300'}>{row.value}</span>
          </div>
        ))}
      </div>
    </section>
  );

  const renderActiveTab = () => {
    if (activeTab === 'overview') return renderOverview();
    if (activeTab === 'moderation') return renderModeration();
    if (activeTab === 'users') return renderUsers();
    if (activeTab === 'reports') {
      return renderSimplePanel('Reports & flags', 'Operational queue for abuse reports and organizer disputes.', [
        { title: 'Suspicious ticket claim', meta: '2 attendees reported duplicate QR screenshots', value: 'High', tone: 'text-sm font-black text-red-300' },
        { title: 'Organizer verification needed', meta: 'Business proof pending review', value: 'Open' },
        { title: 'Content quality review', meta: 'Event image appears unrelated', value: 'Open' },
      ]);
    }
    if (activeTab === 'revenue') {
      return renderSimplePanel('Revenue', 'Confirmed payment activity across the platform.', [
        { title: 'Platform gross revenue', meta: `${transactions.length} transaction records`, value: formatCurrency(totals.revenue), tone: 'text-sm font-black text-emerald-300' },
        { title: 'Published events', meta: 'Currently visible to attendees', value: publishedEvents.length },
        { title: 'Pending monetized events', meta: 'Awaiting approval before ticket sales', value: pendingEvents.filter((event) => event.price > 0).length },
      ]);
    }
    if (activeTab === 'refunds') {
      return renderSimplePanel('Refunds', 'Refund requests and cancelled-event fallout.', [
        { title: 'Pending refund requests', meta: 'Awaiting payment gateway reconciliation', value: refundCount, tone: 'text-sm font-black text-amber-300' },
        { title: 'Cancelled event refunds', meta: 'Requires manual review when payouts exist', value: '0' },
      ]);
    }
    if (activeTab === 'audit') {
      return renderSimplePanel('Audit log', 'Recent administrative activity.', [
        { title: 'Admin session active', meta: user.email, value: 'Now', tone: 'text-sm font-black text-emerald-300' },
        { title: 'Moderation queue loaded', meta: `${pendingEvents.length} pending events fetched`, value: 'Live' },
      ]);
    }
    if (activeTab === 'announcements') {
      return renderSimplePanel('Announcements', 'Broadcasts to organizers and attendees.', [
        { title: 'Organizer policy reminder', meta: 'Draft a message for approval requirements', value: 'Draft' },
        { title: 'Payment maintenance notice', meta: 'No active announcement', value: 'Idle' },
      ]);
    }
    return renderSimplePanel('Settings', 'Platform administration controls.', [
      { title: 'Fixed super admin', meta: SUPER_ADMIN_EMAIL, value: 'Locked', tone: 'text-sm font-black text-emerald-300' },
      { title: 'Public admin route', meta: 'No public admin signup or role picker is exposed', value: 'Disabled' },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-zinc-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/10 bg-[#1a1a1a] lg:flex lg:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <Crown className="h-5 w-5 text-sky-400" />
          <span className="text-lg font-black text-white">FUNDO admin</span>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-zinc-500">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  const badge = item.badgeKey === 'pending' ? pendingEvents.length : item.badgeKey === 'flags' ? flagCount : null;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition ${
                        active ? 'bg-sky-500/20 text-sky-200' : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.label}</span>
                      {badge ? (
                        <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-200">{badge}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-black/20 p-3">
            <p className="text-sm font-black text-white">Aditya</p>
            <p className="text-xs text-zinc-500">super admin</p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a1a1a]/95 px-4 py-4 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-black text-white">{navGroups.flatMap((group) => group.items).find((item) => item.id === activeTab)?.label || 'Dashboard'}</p>
              <p className="text-sm text-zinc-500">Platform overview</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-white"
                aria-label="Refresh admin dashboard"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold text-white">Aditya</p>
                <p className="text-xs text-zinc-500">super admin</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300 hover:text-red-300"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center gap-2 lg:hidden">
            {navGroups.flatMap((group) => group.items).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                  activeTab === item.id
                    ? 'border-sky-400/40 bg-sky-500/20 text-sky-200'
                    : 'border-white/10 bg-white/[0.04] text-zinc-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mb-6 rounded-lg border border-sky-400/20 bg-sky-400/5 p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-sky-300" />
              <div>
                <p className="font-black text-white">Fixed super-admin session</p>
                <p className="text-sm text-zinc-400">This account is locked to {SUPER_ADMIN_EMAIL}; public routes redirect back here.</p>
              </div>
            </div>
          </div>

          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
