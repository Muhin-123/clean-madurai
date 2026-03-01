import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle,
  MapPin, ChevronRight, X, Loader2, ThumbsDown, Play,
  CheckSquare, Trash2, Camera, Send, MessageSquare
} from 'lucide-react';
import {
  collection, query, where, onSnapshot, orderBy,
  updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { uploadToSupabase } from '../../supabase';
import toast from 'react-hot-toast';

// ─── Status config ─────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: '#F48C06',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    ring: 'ring-orange-200',
    glow: 'shadow-orange-100',
  },
  accepted: {
    label: 'In Progress',
    color: '#457B9D',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    ring: 'ring-blue-200',
    glow: 'shadow-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    color: '#2D6A4F',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    ring: 'ring-emerald-200',
    glow: 'shadow-emerald-100',
  },
  completed: {
    label: 'Completed',
    color: '#52B788',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-200',
    glow: 'shadow-green-100',
  },
  resolved: {
    label: 'Resolved',
    color: '#52B788',
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-200',
    glow: 'shadow-green-100',
  },
};

// Normalize various status formats used across the app into a consistent key
function normalizeStatus(raw) {
  const s = (raw || '').toString().toLowerCase().trim();
  if (!s) return 'pending';
  if (s.includes('completed')) return 'completed';
  if (s.includes('resolved')) return 'resolved';
  if (s.includes('in progress') || s.includes('in_progress') || s.includes('in-progress') || s === 'accepted' || s === 'inprogress') return 'in_progress';
  if (s.includes('pending')) return 'pending';
  return s.replace(/\s+/g, '_');
}

function StatusBadge({ status }) {
  const key = normalizeStatus(status);
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.pending;
  return (
    <motion.span
      layout
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${cfg.bg} ${cfg.text} ${cfg.ring}`}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </motion.span>
  );
}

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const timer = setInterval(() => {
      start += Math.ceil(end / 15);
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 50);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
}

function StatCard({ label, value, icon: Icon, iconColor, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white border border-[#457B9D]/15 shadow-sm p-6 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${iconColor}18` }}>
        <Icon size={22} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-3xl font-black text-[#1D3557]"><AnimatedCounter value={value} /></p>
        <p className="text-[10px] font-bold text-[#457B9D]/60 uppercase tracking-[0.18em]">{label}</p>
      </div>
    </motion.div>
  );
}

function TaskCard({ task, onSelect, onAccept, delay = 0 }) {
  const status = normalizeStatus(task.status);
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const [localLoading, setLocalLoading] = useState(false);

  const handleAccept = async (e) => {
    e.stopPropagation();
    if (onAccept) {
      setLocalLoading(true);
      await onAccept(task);
      setLocalLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(task)}
      className={`group relative flex items-center gap-4 p-5 rounded-2xl bg-white border border-[#1D3557]/8 hover:border-[#457B9D]/30 shadow-sm hover:shadow-md cursor-pointer transition-all ${cfg.glow}`}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${cfg.color}18` }}>
        <MapPin size={20} style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={task.status} />
          <span className="text-[10px] font-bold text-[#457B9D]/40 uppercase tracking-widest">
            {task.created_at?.toDate?.()?.toLocaleDateString() || 'Recently'}
          </span>
        </div>
        <p className="font-bold text-[#1D3557] text-sm truncate group-hover:text-[#457B9D] transition-colors">
          {task.description || task.type || 'Civic Complaint'}
        </p>
        <p className="text-[10px] font-semibold text-[#457B9D]/50 uppercase tracking-wide truncate mt-0.5">
          {task.location || task.ward_id || 'Area location'}
        </p>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {status === 'pending' ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAccept}
            disabled={localLoading}
            className="px-4 py-2 rounded-xl bg-[#1D3557] text-white text-xs font-black uppercase tracking-widest hover:bg-[#1D3557]/90 shadow-lg shadow-[#1D3557]/15 flex items-center gap-2"
          >
            {localLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
            Accept Task
          </motion.button>
        ) : (
          <ChevronRight size={18} className="text-[#457B9D]/30 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </motion.div>
  );
}

function TaskModal({ task, onClose }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [notes, setNotes] = useState('');
  const [showAfterPhotoInput, setShowAfterPhotoInput] = useState(false);
  const { currentUser, userProfile, updatePoints } = useAuth();

  const updateStatus = async (newStatus, extraFields = {}) => {
    if (newStatus === 'completed' && !afterPhoto) {
      toast.error('Completion photo is mandatory!');
      return;
    }

    setActionLoading(newStatus);
    try {
      let photoFields = {};
      if (newStatus === 'in_progress' && beforePhoto) {
        const url = await uploadToSupabase(beforePhoto, `work_proof/${task.id}/before`);
        photoFields.before_photo_url = url;
      }
      if (newStatus === 'completed' && afterPhoto) {
        const url = await uploadToSupabase(afterPhoto, `work_proof/${task.id}/after`);
        photoFields.after_photo_url = url;
        photoFields.worker_notes = notes;
      }

      await updateDoc(doc(db, 'complaints', task.id), {
        status: newStatus,
        updated_at: serverTimestamp(),
        ...extraFields,
        ...photoFields,
      });

      if (newStatus === 'completed') {
        const citizenId = task.citizen_id || task.citizenId;
        if (citizenId) await updatePoints(citizenId, 10);
        await updatePoints(currentUser.uid, 5);
        toast.success('Task completed successfully!');
      } else {
        toast.success(`Task moved to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      }

      onClose();
    } catch (err) {
      console.error('Status update error:', err);
      toast.error(err.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading('decline');
    try {
      await updateDoc(doc(db, 'complaints', task.id), {
        status: 'Pending',
        assigned_worker: null,
        updated_at: serverTimestamp(),
      });
      toast.success('Task declined.');
      onClose();
    } catch (err) {
      toast.error('Failed to decline task.');
    } finally {
      setActionLoading(null);
    }
  };

  const currentStatus = normalizeStatus(task.status);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r from-[#1D3557] to-[#457B9D]" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
        >
          <X size={18} />
        </button>

        <div className="space-y-6 mt-2">
          <div className="flex items-center justify-between">
            <StatusBadge status={task.status} />
            <span className="text-[10px] font-bold text-[#457B9D]/40 uppercase tracking-widest">
              ID: {task.id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-black text-[#1D3557] leading-tight mb-1">
              {task.description || task.type || 'Complaint'}
            </h3>
            <p className="text-sm text-[#457B9D]/70 font-medium flex items-center gap-2">
              <MapPin size={14} className="text-rose-500" />
              {task.location || task.ward_id || 'Location not specified'}
            </p>
          </div>

          {task.photo_url && (
            <div className="group relative rounded-2xl overflow-hidden border border-[#1D3557]/5 aspect-video bg-gray-100">
              <img src={task.photo_url} alt="Issue" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <p className="text-white text-[10px] font-black uppercase tracking-widest">Initial Citizen Proof</p>
              </div>
            </div>
          )}

          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#1D3557]/5">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList size={14} className="text-[#1D3557]/40" />
              <p className="text-[10px] font-black text-[#1D3557]/40 uppercase tracking-[0.2em]">Details</p>
            </div>
            <p className="text-sm text-[#1D3557]/80 leading-relaxed font-medium">
              {task.description || 'No additional details provided by the citizen.'}
            </p>
          </div>

          <div className="pt-2">
            {currentStatus === 'pending' && (
              <div className="space-y-4">
                <div className="space-y-3 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase tracking-wider">
                    <Camera size={14} />
                    Before Work Photo (Optional)
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBeforePhoto(e.target.files[0])}
                    className="text-xs text-orange-800/80 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-all w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => updateStatus('in_progress')}
                    disabled={!!actionLoading}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#1D3557] text-white font-black text-sm hover:bg-[#1D3557]/90 transition-all shadow-lg shadow-[#1D3557]/20 disabled:opacity-50"
                  >
                    {actionLoading === 'in_progress' ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                    Accept & Start
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDecline}
                    disabled={!!actionLoading}
                    className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold text-sm hover:bg-rose-100 transition-all border border-rose-100 disabled:opacity-50"
                  >
                    {actionLoading === 'decline' ? <Loader2 size={18} className="animate-spin" /> : <ThumbsDown size={18} />}
                    Decline
                  </motion.button>
                </div>
              </div>
            )}

            {currentStatus === 'in_progress' && (
              <div className="space-y-4">
                {!showAfterPhotoInput ? (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowAfterPhotoInput(true)}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-600 text-white font-black text-base hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200"
                  >
                    <CheckSquare size={20} />
                    Mark as Completed
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100"
                  >
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                        <Camera size={14} />
                        After Work Photo (Mandatory) *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAfterPhoto(e.target.files[0])}
                        className="text-xs text-emerald-800/80 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200 transition-all w-full border border-emerald-200/50 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[10px] font-black text-emerald-800/60 uppercase tracking-widest">
                        <MessageSquare size={14} />
                        Work Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Cleared the debris, informed local residents..."
                        className="w-full p-3 rounded-xl border border-emerald-200 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px] text-[#1D3557]"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => updateStatus('completed')}
                        disabled={!!actionLoading || !afterPhoto}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-600 text-white font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-40"
                      >
                        {actionLoading === 'completed' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Submit Proof
                      </motion.button>
                      <button
                        onClick={() => setShowAfterPhotoInput(false)}
                        className="px-6 py-4 rounded-2xl bg-white text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all border border-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {currentStatus === 'completed' && (
              <div className="space-y-5">
                <div className="flex items-center justify-center gap-3 py-4 text-emerald-700 font-black text-sm bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
                  <CheckCircle2 size={20} />
                  TASK VERIFIED & COMPLETED
                </div>

                {task.worker_notes && (
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 italic text-sm text-[#1D3557]/70">
                    "{task.worker_notes}"
                  </div>
                )}

                {(task.before_photo_url || task.after_photo_url) && (
                  <div className="grid grid-cols-2 gap-3">
                    {task.before_photo_url && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Initial State</p>
                        <img src={task.before_photo_url} className="w-full h-24 object-cover rounded-xl shadow-sm" alt="Before" />
                      </div>
                    )}
                    {task.after_photo_url && (
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Resolution</p>
                        <img src={task.after_photo_url} className="w-full h-24 object-cover rounded-xl shadow-sm" alt="After" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Worker Dashboard ─────────────────────────────────────────────────

export default function WorkerDashboard() {
  const { currentUser, userProfile, updatePoints } = useAuth();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'complaints'),
      where('assigned_worker', '==', currentUser.uid),
      orderBy('updated_at', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setAllTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error('WorkerDashboard complaints error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser?.uid]);

  const assigned = useMemo(() => allTasks.filter(t => normalizeStatus(t.status) === 'pending'), [allTasks]);
  const active = useMemo(() => allTasks.filter(t => {
    const s = normalizeStatus(t.status);
    return s === 'in_progress' || s === 'accepted';
  }), [allTasks]);
  const completed = useMemo(() => allTasks.filter(t => {
    const s = normalizeStatus(t.status);
    return s === 'completed' || s === 'resolved';
  }), [allTasks]);

  const handleAcceptTask = async (task) => {
    try {
      await updateDoc(doc(db, 'complaints', task.id), {
        status: 'in_progress',
        updated_at: serverTimestamp(),
      });
      toast.success('Task accepted! It is now in progress.');
    } catch (err) {
      toast.error('Failed to accept task.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-xs font-bold text-[#457B9D]/60 uppercase tracking-[0.25em] mb-1">Field Operations</p>
          <h1 className="text-4xl font-black text-[#1D3557] tracking-tight">My Tasks</h1>
          <p className="text-[#457B9D]/70 font-medium mt-1">Manage your assigned civic complaints</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1D3557] text-white font-bold text-sm shadow-lg shadow-[#1D3557]/20">
          <ClipboardList size={15} />
          {allTasks.length} Total Tasks
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned" value={assigned.length} icon={AlertCircle} iconColor="#F48C06" delay={0.05} />
        <StatCard label="In Progress" value={active.length} icon={Clock} iconColor="#457B9D" delay={0.1} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} iconColor="#2D6A4F" delay={0.15} />
        <StatCard label="Earned Points" value={userProfile?.points || 0} icon={CheckSquare} iconColor="#1D3557" delay={0.2} />
      </div>

      <LayoutGroup>
        {/* Section 1 – Assigned Tasks */}
        <section className="bg-white rounded-3xl border border-[#1D3557]/8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#1D3557]/6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertCircle size={18} className="text-orange-500" />
              </div>
              <h2 className="text-lg font-black text-[#1D3557]">Assigned Tasks</h2>
            </div>
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              {assigned.length} pending
            </span>
          </div>
          <div className="p-6 space-y-3">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl" />
              ))
            ) : assigned.length === 0 ? (
              <div className="text-center py-12 text-[#457B9D]/40">
                <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold uppercase tracking-wider text-xs">No pending tasks</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {assigned.map((t) => (
                  <TaskCard key={t.id} task={t} onSelect={setSelectedTask} onAccept={handleAcceptTask} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Section 2 – In Progress Tasks */}
        <section className="bg-white rounded-3xl border border-[#457B9D]/15 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-[#457B9D]/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock size={18} className="text-[#457B9D]" />
              </div>
              <h2 className="text-lg font-black text-[#1D3557]">In Progress Tasks</h2>
            </div>
            <span className="text-xs font-bold text-[#457B9D] bg-blue-50 px-3 py-1 rounded-full">
              {active.length} active
            </span>
          </div>
          <div className="p-6 space-y-3">
            {active.length === 0 ? (
              <div className="text-center py-10 text-[#457B9D]/40">
                <Clock size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold uppercase tracking-wider text-xs">No active tasks</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {active.map((t) => (
                  <TaskCard key={t.id} task={t} onSelect={setSelectedTask} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Section 3 – Completed Tasks */}
        <section className="bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-green-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <CheckCircle2 size={18} className="text-green-600" />
              </div>
              <h2 className="text-lg font-black text-[#1D3557]">Completed Tasks</h2>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
              {completed.length} done
            </span>
          </div>
          <div className="p-6 space-y-3">
            {completed.length === 0 ? (
              <div className="text-center py-10 text-gray-300">
                <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
                <p className="font-bold uppercase tracking-wider text-xs">No completed tasks yet</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {completed.slice(0, 5).map((t) => (
                  <TaskCard key={t.id} task={t} onSelect={setSelectedTask} />
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>
      </LayoutGroup>

      {/* Task modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
        <div>
          <p className="text-xs font-bold text-[#457B9D]/60 uppercase tracking-[0.25em] mb-1">Field Operations</p>
          <h1 className="text-4xl font-black text-[#1D3557] tracking-tight">My Tasks</h1>
          <p className="text-[#457B9D]/70 font-medium mt-1">Manage your assigned civic complaints</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1D3557] text-white font-bold text-sm shadow-lg shadow-[#1D3557]/20">
          <ClipboardList size={15} />
          {allTasks.length} Total Tasks
        </div>
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Assigned" value={assigned.length} icon={AlertCircle} iconColor="#F48C06" delay={0.05} />
        <StatCard label="In Progress" value={active.length} icon={Clock} iconColor="#457B9D" delay={0.1} />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} iconColor="#2D6A4F" delay={0.15} />
        <StatCard label="Earned Points" value={userProfile?.points || 0} icon={CheckSquare} iconColor="#1D3557" delay={0.2} />
      </div>

      {/* Section 1 – Assigned Tasks */}
      <section className="bg-white rounded-3xl border border-[#1D3557]/8 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#1D3557]/6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
              <AlertCircle size={18} className="text-orange-500" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">Assigned Tasks</h2>
          </div>
          <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
            {assigned.length} pending
          </span>
        </div>
        <div className="p-6 space-y-3">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-50 animate-pulse rounded-2xl" />
            ))
          ) : assigned.length === 0 ? (
            <div className="text-center py-12 text-[#457B9D]/40">
              <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No pending tasks</p>
            </div>
          ) : (
            <AnimatePresence>
              {assigned.map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Section 2 – In Progress Tasks */}
      <section className="bg-white rounded-3xl border border-[#457B9D]/15 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#457B9D]/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Clock size={18} className="text-[#457B9D]" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">In Progress Tasks</h2>
          </div>
          <span className="text-xs font-bold text-[#457B9D] bg-blue-50 px-3 py-1 rounded-full">
            {active.length} in progress
          </span>
        </div>
        <div className="p-6 space-y-3">
          {active.length === 0 ? (
            <div className="text-center py-10 text-[#457B9D]/40">
              <Clock size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No active tasks</p>
            </div>
          ) : (
            <AnimatePresence>
              {active.map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.05} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Section 3 – Completed Tasks */}
      <section className="bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-green-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <h2 className="text-lg font-black text-[#1D3557]">Completed Tasks</h2>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full">
            {completed.length} done
          </span>
        </div>
        <div className="p-6 space-y-3">
          {completed.length === 0 ? (
            <div className="text-center py-10 text-gray-300">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold uppercase tracking-wider text-xs">No completed tasks yet</p>
            </div>
          ) : (
            <AnimatePresence>
              {completed.slice(0, 5).map((t, i) => (
                <TaskCard key={t.id} task={t} onSelect={setSelectedTask} delay={i * 0.03} />
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Task modal */}
      <AnimatePresence>
        {selectedTask && (
          <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
