import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, query, where, onSnapshot, orderBy,
  doc, updateDoc, serverTimestamp, getDocs, limit
} from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, CheckCircle, Clock, AlertTriangle,
  Users, Leaf, ChevronDown, Loader2, X,
  TrendingUp, Activity, Bell, Calendar
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Title, Tooltip, Legend, Filler
);

// ─── Animated Counter ──────────────────────────────────────────────────────

function AnimatedCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const timer = setInterval(() => {
      start += Math.ceil(end / 20);
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ─── Status Badge ──────────────────────────────────────────────────────────

const STATUS_STYLES = {
  pending: { bg: 'bg-orange-50 text-orange-600 ring-1 ring-orange-200', dot: '#F48C06' },
  accepted: { bg: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200', dot: '#457B9D' },
  in_progress: { bg: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200', dot: '#6366F1' },
  completed: { bg: 'bg-green-50 text-green-700 ring-1 ring-green-200', dot: '#16A34A' },
  resolved: { bg: 'bg-green-50 text-green-700 ring-1 ring-green-200', dot: '#16A34A' },
};

function StatusBadge({ status }) {
  const normalizedStatus = (status || 'pending').toLowerCase().replace(' ', '_');
  const style = STATUS_STYLES[normalizedStatus] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: style.dot }} />
      {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1).replace('_', ' ')}
    </span>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, suffix = '', icon: Icon, iconColor, bg, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-[#6A040F]/10 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <TrendingUp size={14} className="text-gray-300" />
      </div>
      <p className="text-3xl font-black text-[#370617]">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      <p className="text-[10px] font-bold text-[#6A040F]/50 uppercase tracking-[0.2em] mt-1">{label}</p>
    </motion.div>
  );
}

// ─── Assign Worker Modal ───────────────────────────────────────────────────

function AssignWorkerModal({ complaint, workers, onClose }) {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!selectedWorker) { toast.error('Please select a worker.'); return; }
    setSaving(true);
    try {
      const worker = workers.find(w => w.id === selectedWorker);
      await updateDoc(doc(db, 'complaints', complaint.id), {
        assigned_worker: selectedWorker,
        assignedWorkerName: worker?.name || 'Unknown',
        status: 'pending',
        updated_at: serverTimestamp(),
      });
      toast.success(`Assigned to ${worker?.name || 'worker'} successfully!`);
      onClose();
    } catch (err) {
      console.error('Assign worker error:', err);
      toast.error('Failed to assign worker.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#6A040F] to-[#E85D04]" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          <X size={16} />
        </button>

        <h3 className="text-xl font-black text-[#370617] mb-1">Assign Worker</h3>
        <p className="text-sm text-[#6A040F]/50 mb-6 truncate">
          {complaint.description || complaint.type || 'Complaint'} · {complaint.location || complaint.ward_id}
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#370617]/60 uppercase tracking-widest block mb-2">
              Select Field Worker
            </label>
            <div className="relative">
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
                className="w-full appearance-none bg-[#F4F7F3] border border-[#6A040F]/15 rounded-2xl px-4 py-3 text-sm font-semibold text-[#370617] focus:outline-none focus:ring-2 focus:ring-[#6A040F]/30 pr-10"
              >
                <option value="">-- Choose a worker --</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name} ({w.email})</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A040F]/40 pointer-events-none" />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAssign}
            disabled={saving || !selectedWorker}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#6A040F] text-white font-bold text-sm hover:bg-[#370617] transition-all disabled:opacity-50 shadow-lg shadow-[#6A040F]/20"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
            {saving ? 'Assigning...' : 'Assign Worker'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Officer Dashboard ────────────────────────────────────────────────

export default function OfficerDashboard() {
  const { currentUser, updatePoints } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [wasteListings, setWasteListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch citizens for leaderboard
  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', '==', 'citizen'),
      orderBy('points', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      setCitizens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => {
      console.error('Leaderboard error:', err);
      // Fallback
      const q2 = query(collection(db, 'users'), where('role', '==', 'citizen'), limit(10));
      onSnapshot(q2, s => setCitizens(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    });
    return () => unsub();
  }, []);

  // Fetch all complaints
  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      orderBy('created_at', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error('Officer complaints error:', err);

      // Fallback – try without orderBy (for index-less Firestore)
      const q2 = query(collection(db, 'complaints'));
      onSnapshot(q2, (snap2) => {
        setComplaints(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      }, () => setLoading(false));
    });
    return () => unsub();
  }, []);

  // Fetch workers
  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'worker'));
    const unsub = onSnapshot(q, (snap) => {
      setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Fetch waste listings count
  useEffect(() => {
    const q = query(collection(db, 'bio_waste_market'));
    const unsub = onSnapshot(q, (snap) => {
      setWasteListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Analytics
  const totalComplaints = complaints.length;
  const resolved = complaints.filter(c =>
    c.status === 'completed' || c.status === 'resolved'
  ).length;
  const resolvedPct = totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0;
  const pending = complaints.filter(c =>
    c.status === 'pending'
  ).length;
  const inProgress = complaints.filter(c =>
    c.status === 'in_progress' || c.status === 'accepted'
  ).length;

  // Critical alerts: pending > 48 hours
  const now = Date.now();
  const criticalAlerts = complaints.filter(c => {
    const isPending = c.status === 'pending';
    if (!isPending) return false;
    const created = c.createdAt?.toDate?.() || (c.created_at?.toDate?.());
    if (!created) return false;
    return (now - created.getTime()) > 48 * 60 * 60 * 1000;
  });

  // Filter tabs
  const filteredComplaints = activeTab === 'all' ? complaints
    : activeTab === 'pending' ? complaints.filter(c => c.status === 'pending')
      : activeTab === 'active' ? complaints.filter(c =>
        c.status === 'in_progress' || c.status === 'accepted'
      )
        : complaints.filter(c => c.status === 'completed' || c.status === 'resolved');

  // Chart data
  const weeklyLabels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString('en-IN', { weekday: 'short' });
  });
  const weeklyData = weeklyLabels.map((_, i) => {
    const day = new Date(); day.setDate(day.getDate() - (6 - i));
    return complaints.filter(c => {
      const cd = c.createdAt?.toDate?.() || c.created_at?.toDate?.();
      if (!cd) return false;
      return cd.toDateString() === day.toDateString();
    }).length;
  });

  const statusChartData = {
    labels: ['Pending', 'In Progress', 'Completed'],
    datasets: [{
      data: [pending, inProgress, resolved],
      backgroundColor: ['#F48C06', '#6366F1', '#16A34A'],
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-bold text-[#9D0208]/60 uppercase tracking-[0.25em] mb-1">Administrative</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#370617] tracking-tight">City Command</h1>
          <p className="text-[#9D0208]/60 font-medium mt-1">Real-time civic intelligence & control</p>
        </div>
        {criticalAlerts.length > 0 && (
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-300"
          >
            <Bell size={15} />
            {criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}
          </motion.div>
        )}
      </motion.header>

      {/* Analytics Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Complaints" value={totalComplaints} icon={ClipboardList} iconColor="#6A040F" bg="#FEE2E2" delay={0.05} />
        <StatCard label="Resolved %" value={resolvedPct} suffix="%" icon={CheckCircle} iconColor="#16A34A" bg="#DCFCE7" delay={0.1} />
        <StatCard label="Active Workers" value={workers.length} icon={Users} iconColor="#1D3557" bg="#DBEAFE" delay={0.15} />
        <StatCard label="Waste Listings" value={wasteListings.length} icon={Leaf} iconColor="#2D6A4F" bg="#D1FAE5" delay={0.2} />
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border border-red-200 rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-600" />
            <h2 className="text-lg font-black text-red-800">Critical Alerts — Overdue ({'>'}48h)</h2>
          </div>
          <div className="grid gap-3">
            {criticalAlerts.slice(0, 4).map(c => {
              const created = c.createdAt?.toDate?.() || c.created_at?.toDate?.();
              const hoursAgo = created ? Math.floor((now - created.getTime()) / (1000 * 60 * 60)) : '?';
              return (
                <div key={c.id} className="flex items-center justify-between bg-white rounded-2xl px-5 py-3 border border-red-100">
                  <div>
                    <p className="font-bold text-red-800 text-sm">{c.description || c.type || 'Complaint'}</p>
                    <p className="text-xs text-red-500">{c.location || c.ward_id} · {hoursAgo}h ago</p>
                  </div>
                  <button
                    onClick={() => setSelectedComplaint(c)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-all"
                  >
                    Assign
                  </button>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#6A040F]/10 shadow-sm p-7">
          <h2 className="text-lg font-black text-[#370617] mb-6">Weekly Activity</h2>
          <div className="h-52">
            <Line
              data={{
                labels: weeklyLabels,
                datasets: [{
                  label: 'Complaints',
                  data: weeklyData,
                  borderColor: '#6A040F',
                  backgroundColor: 'rgba(106,4,15,0.08)',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#6A040F',
                  pointRadius: 4,
                }],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#9D0208', font: { size: 11 } } },
                  y: { grid: { color: 'rgba(106,4,15,0.05)' }, ticks: { color: '#9D0208', font: { size: 11 } } },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#6A040F]/10 shadow-sm p-7">
          <h2 className="text-lg font-black text-[#370617] mb-6">Status Breakdown</h2>
          <div className="h-52">
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { color: '#370617', font: { size: 10, weight: 'bold' }, boxWidth: 10 },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-[#6A040F]/10 shadow-sm p-7">
          <h2 className="text-lg font-black text-[#370617] mb-6">Citizen Leaderboard</h2>
          <div className="space-y-4">
            {citizens.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No citizen data</p>
            ) : (
              citizens.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 border border-gray-100/50">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'}`}>
                      {i + 1}
                    </span>
                    <p className="text-xs font-bold text-[#370617]">{c.name}</p>
                  </div>
                  <span className="text-xs font-black text-[#6A040F]">{c.points || 0} pts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <section className="bg-white rounded-3xl border border-[#6A040F]/10 shadow-sm overflow-hidden">
        {/* Tab filter */}
        <div className="flex items-center justify-between p-6 border-b border-[#6A040F]/6">
          <h2 className="text-lg font-black text-[#370617]">All Complaints</h2>
          <div className="flex gap-1.5 bg-[#F4F7F3] rounded-2xl p-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'active', label: 'Active' },
              { key: 'resolved', label: 'Resolved' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key
                    ? 'bg-[#6A040F] text-white shadow'
                    : 'text-[#6A040F]/60 hover:text-[#6A040F]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FEF3F2] text-[#6A040F]/60">
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Citizen</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Description</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Location</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Status</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Worker</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Date</th>
                <th className="text-left px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FEE2E2]/50">
              {loading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6, 7].map(j => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 animate-pulse rounded-lg" style={{ width: `${40 + j * 10}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400">
                    <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold uppercase tracking-wider text-xs">No complaints found</p>
                  </td>
                </tr>
              ) : (
                filteredComplaints.slice(0, 20).map((c, i) => {
                  const date = c.createdAt?.toDate?.() || c.created_at?.toDate?.();
                  const assignedWorker = workers.find(w => w.id === c.assigned_worker);
                  return (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-[#FEF3F2]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#FEE2E2] flex items-center justify-center text-xs font-black text-[#6A040F]">
                            {(c.citizenName || c.citizen_name || '?')[0]?.toUpperCase()}
                          </div>
                          <span className="font-semibold text-[#370617] text-xs truncate max-w-[80px]">
                            {c.citizenName || c.citizen_name || 'Citizen'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-[180px]">
                        <p className="font-semibold text-[#370617] text-xs truncate">
                          {c.description || c.type || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6A040F]/60 font-medium">
                        {c.location || c.ward_id || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-[#6A040F]/70 font-medium">
                        {assignedWorker?.name || c.assignedWorkerName || (
                          <span className="text-gray-300 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {date ? date.toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedComplaint(c)}
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#6A040F]/8 text-[#6A040F] hover:bg-[#6A040F] hover:text-white transition-all"
                        >
                          Assign
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Assign Worker Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <AssignWorkerModal
            complaint={selectedComplaint}
            workers={workers}
            onClose={() => setSelectedComplaint(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
