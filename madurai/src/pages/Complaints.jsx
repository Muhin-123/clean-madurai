import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, MapPin, Clock, Camera, X,
  CheckCircle2, AlertCircle, Loader2, QrCode, UserCheck,
} from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { uploadToSupabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { useComplaints, useWorkers } from '../hooks/useFirebaseData';
import { WARDS, COMPLAINT_TYPES } from '../utils/constants';
import { SkeletonRow } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'badge-amber', in_progress: 'badge-amber', resolved: 'badge-green' };
const PRIORITY_BADGE = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-green' };

function AssignModal({ complaint, workers, onClose }) {
  const [selectedWorker, setSelectedWorker] = useState('');
  const [assigning, setAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedWorker) return;
    setAssigning(true);
    try {
      await updateDoc(doc(db, 'complaints', complaint.id), {
        assigned_worker: selectedWorker,
        status: 'pending',
        updated_at: serverTimestamp(),
      });
      toast.success('Worker assigned successfully');
      onClose();
    } catch {
      toast.error('Failed to assign worker');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-sm p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-civic-green dark:text-civic-green" /> Assign to Worker
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/20 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {workers.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No workers registered yet</p>
          ) : (
            workers.map((w) => (
              <button
                key={w.id}
                onClick={() => setSelectedWorker(w.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border text-sm text-left transition-all ${selectedWorker === w.id
                  ? 'border-civic-green dark:border-civic-green bg-civic-green/10 dark:bg-civic-green/10'
                  : 'border-gray-200 dark:border-white/10 hover:border-civic-green/40'
                  }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-civic-green to-civic-green flex items-center justify-center text-white text-xs font-bold">
                  {(w.name || 'W').charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-white">{w.name}</p>
                  <p className="text-xs text-gray-400">{w.ward || 'All wards'}</p>
                </div>
              </button>
            ))
          )}
          <button
            onClick={handleAssign}
            disabled={!selectedWorker || assigning}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Assign Worker
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatusUpdateModal({ complaint, onClose }) {
  const [status, setStatus] = useState(complaint.status);
  const [updating, setUpdating] = useState(false);
  const { updatePoints } = useAuth();

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'complaints', complaint.id), {
        status,
        updated_at: serverTimestamp(),
      });

      if (status === 'Resolved' && complaint.status !== 'Resolved') {
        const cid = complaint.citizen_id || complaint.citizenId;
        if (cid) await updatePoints(cid, 10);
      }

      toast.success(`Status updated to ${status}`);
      onClose();
    } catch {
      toast.error('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card w-full max-w-xs p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Update Status</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {['pending', 'in_progress', 'resolved'].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all ${status === s
                ? 'border-civic-green dark:border-civic-green bg-civic-green/10 dark:bg-civic-green/10 text-civic-green dark:text-civic-green'
                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
        <button onClick={handleUpdate} disabled={updating} className="btn-primary w-full flex items-center justify-center gap-2">
          {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function ComplaintForm({ onClose }) {
  const { userProfile, updatePoints } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: '', ward_id: '', description: '', priority: 'Medium', photo: null });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackId, setTrackId] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((f) => ({ ...f, photo: file }));
  };

  const handleSubmit = async () => {
    if (!form.type || !form.ward_id) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (form.photo) {
        photoUrl = await uploadToSupabase(form.photo, 'complaints');
      }

      const docRef = await addDoc(collection(db, 'complaints'), {
        citizenId: userProfile?.uid || 'anonymous',
        citizen_id: userProfile?.uid || 'anonymous',
        citizenName: userProfile?.name || 'Citizen',
        type: form.type,
        ward_id: form.ward_id,
        description: form.description,
        priority: form.priority,
        photo_url: photoUrl,
        status: 'pending',
        assigned_worker: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      setTrackId(docRef.id.slice(0, 8).toUpperCase());
      await updatePoints(userProfile?.uid, 5);
      setSubmitted(true);
      toast.success('+5 points earned for filing a complaint!');
    } catch (err) {
      console.error('❌ Complaint submission error:', err);
      toast.error(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="w-20 h-20 rounded-full bg-civic-green/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-civic-green" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Complaint Filed!</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Registered successfully. +5 points added to your account.</p>
        <div className="glass-card p-4 mb-6 inline-block">
          <p className="text-xs text-gray-400 mb-1">Tracking ID</p>
          <p className="text-2xl font-mono font-bold text-civic-green dark:text-civic-green">{trackId}</p>
        </div>
        <div className="space-y-2 text-sm text-left max-w-xs mx-auto">
          {['Complaint Received ✓', 'Ward Officer Notified ✓', 'Processing...'].map((s, i) => (
            <div key={s} className={`flex items-center gap-2 ${i < 2 ? 'text-civic-green' : 'text-gray-400'}`}>
              {i < 2 ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{s}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="btn-primary mt-6">Close</button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-1 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-civic-green to-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />
        ))}
      </div>
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">What's the issue?</h3>
          <div className="grid grid-cols-2 gap-2">
            {COMPLAINT_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setForm((f) => ({ ...f, type }))}
                className={`p-3 rounded-xl text-sm font-medium border text-left transition-all ${form.type === type
                  ? 'border-civic-green dark:border-civic-green bg-civic-green/10 dark:bg-civic-green/10 text-civic-green dark:text-civic-green'
                  : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-civic-green/50'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ward</label>
            <select className="input-field" value={form.ward_id} onChange={(e) => setForm((f) => ({ ...f, ward_id: e.target.value }))}>
              <option value="">Select Ward</option>
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
            <div className="flex gap-2">
              {['Low', 'Medium', 'High'].map((p) => (
                <button key={p} onClick={() => setForm((f) => ({ ...f, priority: p }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${form.priority === p ? 'border-civic-green bg-civic-green/10 text-civic-green dark:border-civic-green dark:bg-civic-green/10 dark:text-civic-green' : 'border-gray-200 dark:border-white/10 text-gray-500'
                    }`}>{p}</button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep(2)} disabled={!form.type || !form.ward_id} className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            Next →
          </button>
        </motion.div>
      )}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Add Details</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Describe the issue in detail..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Upload Photo *</label>
            <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${form.photo ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20 hover:border-civic-green dark:hover:border-civic-green'
              }`}>
              <Camera className={`w-8 h-8 mb-2 ${form.photo ? 'text-civic-green' : 'text-gray-300 dark:text-gray-600'}`} />
              <span className="text-sm text-gray-400">{form.photo ? form.photo.name : 'Click to upload photo (required)'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
          </div>
        </motion.div>
      )}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">Confirm & Submit</h3>
          <div className="glass-card p-4 space-y-2">
            {[
              { label: 'Type', value: form.type },
              { label: 'Ward', value: form.ward_id },
              { label: 'Priority', value: form.priority },
              { label: 'Description', value: form.description || 'Not provided' },
              { label: 'Photo', value: form.photo ? '✓ Attached' : '✗ No photo' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">{label}</span>
                <span className="font-medium text-gray-800 dark:text-white max-w-[60%] text-right truncate">{value}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green font-medium">
            ⭐ You'll earn +5 points for filing this complaint
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '✓ Submit Complaint'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function Complaints() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [assignTarget, setAssignTarget] = useState(null);
  const [statusTarget, setStatusTarget] = useState(null);

  const { complaints, loading } = useComplaints({});
  const { workers } = useWorkers();

  const filtered = complaints.filter((c) => {
    const matchSearch = (c.type || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.ward_id || '').toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Complaints Management</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-civic-green animate-pulse" />
            <p className="page-subtitle mb-0">Real-time · {complaints.length} total complaints</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> File Complaint
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search complaints..."
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'All', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'resolved', label: 'Resolved' }
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f.key ? 'bg-civic-green dark:bg-civic-green text-white shadow-glow' : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-civic-green dark:hover:border-white/20'
                }`}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="glass-card divide-y divide-white/5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} className="p-4" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={search ? `No complaints match "${search}"` : 'No complaints in this category yet.'}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelected(selected?.id === c.id ? null : c)}
              className="glass-card p-4 cursor-pointer hover:shadow-glow transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.priority === 'High' ? 'bg-alert-red/10' : c.priority === 'Medium' ? 'bg-amber-500/10' : 'bg-green-500/10'
                    }`}>
                    <AlertCircle className={`w-5 h-5 ${c.priority === 'High' ? 'text-alert-red' : c.priority === 'Medium' ? 'text-amber-500' : 'text-green-500'
                      }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">{c.id.slice(0, 8)}</span>
                      <span className={STATUS_BADGE[c.status] || 'badge-blue'}>{c.status || 'Pending'}</span>
                      <span className={PRIORITY_BADGE[c.priority] || 'badge-amber'}>{c.priority || 'Medium'}</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.type}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{c.ward_id || '—'}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{c.created_at?.toDate?.()?.toLocaleTimeString?.() || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {c.status !== 'Resolved' && (
                    <>
                      <button
                        onClick={() => setAssignTarget(c)}
                        className="text-xs px-2 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-civic-green dark:text-green-400 font-medium hover:bg-green-100 transition-colors"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => setStatusTarget(c)}
                        className="text-xs px-2 py-1.5 rounded-lg bg-civic-green/10 text-civic-green dark:bg-civic-green/10 dark:text-civic-green font-medium hover:bg-civic-green/20 transition-colors"
                      >
                        Update
                      </button>
                    </>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {selected?.id === c.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
                      {[
                        { label: 'Complaint ID', value: c.id.slice(0, 12) },
                        { label: 'Ward', value: c.ward_id || '—' },
                        { label: 'Assigned To', value: c.assigned_worker ? c.assigned_worker.slice(0, 8) : 'Unassigned' },
                      ].map(({ label, value }) => (
                        <div key={label} className="text-center p-2 bg-white/30 dark:bg-white/5 rounded-xl">
                          <p className="text-[10px] text-gray-400">{label}</p>
                          <p className="text-sm font-semibold text-gray-800 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>
                    {c.photo_url && (
                      <div className="mt-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Photo</p>
                        <img src={c.photo_url} alt="Complaint" className="w-full h-32 object-cover rounded-xl" />
                      </div>
                    )}
                    {(c.before_photo_url || c.after_photo_url) && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {c.before_photo_url && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Before Work</p>
                            <img src={c.before_photo_url} alt="Before" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                          </div>
                        )}
                        {c.after_photo_url && (
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">After Work</p>
                            <img src={c.after_photo_url} alt="After" className="w-full h-24 object-cover rounded-xl border border-white/10" />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <div className="flex items-center gap-1.5 flex-1">
                        {['Filed', 'Assigned', 'In Progress', 'Resolved'].map((stage, idx) => {
                          const stageIdx = c.status === 'pending' ? 1 : c.status === 'in_progress' ? 2 : (c.status === 'resolved' || c.status === 'completed') ? 4 : 0;
                          return (
                            <div key={stage} className="flex items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${idx < stageIdx ? 'bg-civic-green text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                                {idx + 1}
                              </div>
                              {idx < 3 && <div className={`flex-1 h-0.5 ${idx < stageIdx - 1 ? 'bg-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-card w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-civic-green dark:text-civic-green" />
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">File Complaint</h2>
                </div>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-white/20 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <ComplaintForm onClose={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {assignTarget && (
          <AssignModal complaint={assignTarget} workers={workers} onClose={() => setAssignTarget(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {statusTarget && (
          <StatusUpdateModal complaint={statusTarget} onClose={() => setStatusTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
