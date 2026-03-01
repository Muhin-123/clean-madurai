import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Plus, Camera, X, CheckCircle2, Loader2, AlertCircle, Clock, MapPin, QrCode
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { uploadToSupabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../hooks/useFirebaseData';
import { WARDS } from '../../data/mockData';
import { SkeletonRow } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import CameraQRScanner from '../../components/CameraQRScanner';
import toast from 'react-hot-toast';

const STATUS_BADGE = { pending: 'badge-amber', in_progress: 'badge-amber', resolved: 'badge-green' };
const COMPLAINT_TYPES = ['Garbage Overflow', 'Open Drain', 'Dead Animal', 'Street Cleaning', 'Blocked Drain', 'Illegal Dumping', 'Toilet Issue', 'Other'];

function ComplaintModal({ onClose, initialData = null }) {
  const { userProfile, updatePoints } = useAuth();
  const [step, setStep] = useState(initialData?.binData ? 2 : 1);
  const [form, setForm] = useState({
    type: initialData?.binData?.type || '',
    ward_id: initialData?.binData?.ward || '',
    description: initialData?.binData?.location ? `Issue at bin: ${initialData.binData.location}` : '',
    priority: 'Medium',
    photo: null,
    bin_id: initialData?.binData?.bin_id || initialData?.binData?.id || null
  });
  const [submitting, setSubmitting] = useState(false);
  const [trackId, setTrackId] = useState('');

  const handleSubmit = async () => {
    if (!form.type || !form.ward_id) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (form.photo) {
        photoUrl = await uploadToSupabase(form.photo, 'complaints');
      }

      const docRef = await addDoc(collection(db, 'complaints'), {
        citizen_id: userProfile?.uid,
        citizenName: userProfile?.name || 'Citizen',
        type: form.type,
        ward_id: form.ward_id,
        description: form.description,
        bin_id: form.bin_id || null,
        priority: form.priority,
        photo_url: photoUrl,
        status: 'pending',
        assigned_worker: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      setTrackId(docRef.id.slice(0, 8).toUpperCase());
      await updatePoints(userProfile?.uid, 5);
      setStep(4);
      toast.success('⭐ +5 points added to your account!');
    } catch (err) {
      console.error('❌ Complaint submission error:', err);
      toast.error(err.message || 'Error: Could not save complaint. Check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">File Complaint</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {step < 4 && (
          <div className="flex gap-1 mb-5">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-civic-green to-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Select Issue Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {COMPLAINT_TYPES.map((t) => (
                <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`p-3 rounded-xl text-sm border text-left transition-all ${form.type === t ? 'border-civic-green bg-civic-green/10 text-civic-green dark:border-civic-green dark:bg-civic-green/10 dark:text-civic-green' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
                  {t}
                </button>
              ))}
            </div>
            <select className="input-field" value={form.ward_id} onChange={(e) => setForm((f) => ({ ...f, ward_id: e.target.value }))}>
              <option value="">Select Ward *</option>
              {WARDS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
            <button onClick={() => setStep(2)} disabled={!form.type || !form.ward_id} className="btn-primary w-full disabled:opacity-50">Next →</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Describe & Upload</h3>
            <textarea className="input-field resize-none" rows={3} placeholder="Describe the issue..." value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer ${form.photo ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20'}`}>
              <Camera className={`w-6 h-6 mb-1 ${form.photo ? 'text-civic-green' : 'text-gray-300'}`} />
              <span className="text-xs text-gray-400">{form.photo ? form.photo.name : 'Tap to upload photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files[0]; if (f) setForm((x) => ({ ...x, photo: f })); }} />
            </label>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">Next →</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Confirm & Submit</h3>
            <div className="glass-card p-4 space-y-2 text-sm">
              {[
                { label: 'Type', value: form.type },
                { label: 'Ward', value: form.ward_id },
                { label: 'Photo', value: form.photo ? '✓ Attached' : '✗ None' },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-800 dark:text-white">{value}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-green-50 shadow-sm dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-xl text-xs text-green-700 dark:text-green-400 font-medium">
              ⭐ You'll earn +5 points for filing this complaint!
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '✓ Submit'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
              <div className="w-20 h-20 rounded-full bg-civic-green/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-civic-green" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Complaint Filed!</h3>
            <p className="text-sm text-gray-400 mb-4">+5 points added to your account</p>
            <div className="glass-card p-4 mb-5 inline-block">
              <p className="text-xs text-gray-400 mb-1">Tracking ID</p>
              <p className="text-2xl font-mono font-bold text-civic-green dark:text-civic-green">{trackId}</p>
            </div>
            <button onClick={onClose} className="btn-primary block w-full">Close</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function CitizenComplaints() {
  const { userProfile, updatePoints } = useAuth();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [filter, setFilter] = useState('All');
  const { complaints, loading } = useComplaints({ citizenId: userProfile?.uid });

  useEffect(() => {
    if (location.state?.openForm) {
      setModalData({ binData: location.state.binData });
      setShowModal(true);
      // Clean up state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const filtered = filter === 'All' ? complaints : complaints.filter((c) => c.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Complaints</h1>
          <p className="page-subtitle">Track your filed complaints · Real-time updates</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowScanner(true)} className="btn-secondary flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Scan Bin
          </button>
          <button onClick={() => { setModalData(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> File Complaint
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'All', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'in_progress', label: 'In Progress' },
          { key: 'resolved', label: 'Resolved' }
        ].map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === f.key ? 'bg-civic-green dark:bg-civic-green text-white' : 'glass-card text-gray-600 dark:text-gray-400'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'All' ? "No complaints yet" : `No ${filter} complaints`}
          description={filter === 'All' ? "File your first complaint to get started." : ""}
          actionLabel="File Complaint"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status === 'resolved' || c.status === 'completed' ? 'bg-green-500/10' : c.status === 'in_progress' ? 'bg-amber-500/10' : 'bg-amber-500/10'
                  }`}>
                  {c.status === 'resolved' || c.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> :
                    c.status === 'in_progress' ? <Clock className="w-5 h-5 text-amber-500" /> :
                      <AlertCircle className="w-5 h-5 text-amber-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.type}</p>
                    <span className={STATUS_BADGE[c.status] || 'badge-amber'}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.ward_id || '—'}</span>
                    <span className="font-mono">{c.id.slice(0, 8)}</span>
                    <span>{c.created_at?.toDate?.()?.toLocaleDateString?.() || '—'}</span>
                  </div>
                  {c.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{c.description}</p>}

                  <div className="flex items-center gap-1.5 mt-3">
                    {['Filed', 'Assigned', 'In Progress', 'Resolved'].map((stage, idx) => {
                      const stageIdx = c.status === 'pending' ? 1 : c.status === 'in_progress' ? 2 : (c.status === 'resolved' || c.status === 'completed') ? 4 : 0;
                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${idx < stageIdx ? 'bg-civic-green text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>
                            {idx + 1}
                          </div>
                          {idx < 3 && <div className={`flex-1 h-0.5 ${idx < stageIdx - 1 ? 'bg-civic-green' : 'bg-gray-200 dark:bg-white/10'}`} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              {c.photo_url && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Issue Photo</p>
                  <img src={c.photo_url} alt="complaint" className="w-full h-24 object-cover rounded-xl" />
                </div>
              )}

              {(c.before_photo_url || c.after_photo_url) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {c.before_photo_url && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Work Before</p>
                      <img src={c.before_photo_url} alt="before" className="w-full h-20 object-cover rounded-xl border border-gray-100" />
                    </div>
                  )}
                  {c.after_photo_url && (
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Work After</p>
                      <img src={c.after_photo_url} alt="after" className="w-full h-20 object-cover rounded-xl border border-gray-100" />
                    </div>
                  )}
                </div>
              )}

              {(c.status === 'resolved' || c.status === 'completed') && (
                <div className="mt-3 p-2.5 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Resolved! +10 points earned
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <div className="relative w-full max-w-lg">
              <CameraQRScanner onClose={() => setShowScanner(false)} onScan={(bin) => {
                setShowScanner(false);
                setModalData({ binData: bin });
                setShowModal(true);
              }} />
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showModal && <ComplaintModal onClose={() => { setShowModal(false); setModalData(null); }} initialData={modalData} />}
      </AnimatePresence>
    </div>
  );
}
