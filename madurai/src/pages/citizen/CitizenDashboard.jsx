import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  collection, query, where, onSnapshot, addDoc,
  orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { uploadToSupabase } from '../../supabase';
import { useNavigate, Link } from 'react-router-dom';
import {
  MessageSquareWarning, Leaf, Star, QrCode,
  CheckCircle2, Clock, AlertCircle, TrendingUp,
  MapPin, ChevronRight, ClipboardList, Plus, X, Loader2, Camera
} from 'lucide-react';
import CameraQRScanner from '../../components/CameraQRScanner';
import toast from 'react-hot-toast';

function AnimatedCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const timer = setInterval(() => {
      start += Math.ceil(end / 20);
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
      whileHover={{ y: -4, scale: 1.02 }}
      className="bg-white rounded-2xl border border-[#2D6A4F]/12 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}18` }}>
          <Icon size={20} style={{ color: iconColor }} />
        </div>
        <ChevronRight size={14} className="text-gray-200" />
      </div>
      <p className="text-3xl font-black text-[#1B4332]"><AnimatedCounter value={value} /></p>
      <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-[0.18em] mt-1">{label}</p>
    </motion.div>
  );
}

const STATUS_STYLES = {
  pending: 'bg-orange-50 text-orange-600',
  accepted: 'bg-blue-50 text-blue-600',
  in_progress: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-green-50 text-green-700',
  resolved: 'bg-green-50 text-green-700',
};

export default function CitizenDashboard() {
  // CRITICAL FIX: use currentUser.uid (not userProfile?.uid which may be stale)
  const { currentUser, userProfile, updatePoints } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [listings, setListings] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ description: '', location: '', photo: null });
  const [submitting, setSubmitting] = useState(false);

  // Fetch this citizen's complaints
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'complaints'),
      where('citizen_id', '==', currentUser.uid),
      orderBy('created_at', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setComplaints(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setComplaintsLoading(false);
    }, err => {
      console.error('Citizen complaints error:', err);
      const q2 = query(collection(db, 'complaints'), where('citizen_id', '==', currentUser.uid));
      onSnapshot(q2, snap2 => {
        setComplaints(snap2.docs.map(d => ({ id: d.id, ...d.data() })));
        setComplaintsLoading(false);
      }, () => setComplaintsLoading(false));
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Fetch waste listings
  useEffect(() => {
    if (!currentUser?.uid) return;
    const q = query(
      collection(db, 'bio_waste_market'),
      where('seller_id', '==', currentUser.uid)
    );
    const unsub = onSnapshot(q, snap => {
      setListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const resolved = complaints.filter(c =>
    c.status === 'completed' || c.status === 'resolved'
  ).length;

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!newComplaint.description.trim()) {
      toast.error('Please describe the issue.');
      return;
    }
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (newComplaint.photo) {
        photoUrl = await uploadToSupabase(newComplaint.photo, 'complaints');
      }

      await addDoc(collection(db, 'complaints'), {
        citizen_id: currentUser.uid,
        citizenName: userProfile?.name || 'Citizen',
        description: newComplaint.description.trim(),
        location: newComplaint.location.trim() || 'Not specified',
        bin_id: newComplaint.bin_id || null,
        photo_url: photoUrl,
        status: 'pending',
        assigned_worker: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      await updatePoints(currentUser.uid, 5);
      toast.success('Complaint submitted! +5 points added.');
      setNewComplaint({ description: '', location: '', photo: null, bin_id: null });
      setShowComplaintForm(false);
    } catch (err) {
      console.error('❌ Submit complaint error:', err);
      toast.error(err.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
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
          <p className="text-xs font-bold text-[#2D6A4F]/60 uppercase tracking-[0.25em] mb-1">Citizen Portal</p>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B4332] tracking-tight">
            Hello, {userProfile?.name?.split(' ')[0] || 'Citizen'} 👋
          </h1>
          <p className="text-[#2D6A4F]/70 font-medium mt-1">Your impact on Madurai's future starts here</p>
        </div>
        {userProfile?.points > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-50 border border-amber-100 text-amber-700 font-bold text-sm shadow-sm">
            <Star size={15} className="fill-amber-500 text-amber-500" />
            {userProfile.points} pts
          </div>
        )}
      </motion.header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Resolved Issues" value={resolved} icon={CheckCircle2} iconColor="#2D6A4F" delay={0.05} />
        <StatCard label="Waste Listings" value={listings.length} icon={Leaf} iconColor="#52B788" delay={0.1} />
        <StatCard label="Civic Points" value={userProfile?.points || 0} icon={Star} iconColor="#F59E0B" delay={0.15} />
        <StatCard label="Active Complaints" value={complaints.filter(c => c.status !== 'completed' && c.status !== 'resolved').length} icon={AlertCircle} iconColor="#E5383B" delay={0.2} />
      </div>

      {/* Quick Actions */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-[#2D6A4F]/12 shadow-sm p-7"
      >
        <h2 className="text-lg font-black text-[#1B4332] mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowComplaintForm(true)}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F4F7F3] border border-[#2D6A4F]/15 hover:bg-[#2D6A4F] hover:text-white hover:border-transparent group transition-all"
          >
            <MessageSquareWarning size={22} className="text-[#2D6A4F] group-hover:text-white" />
            <span className="text-xs font-bold text-[#1B4332]/80 group-hover:text-white">File Complaint</span>
          </motion.button>

          <Link to="/citizen/bio-waste">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F4F7F3] border border-[#2D6A4F]/15 hover:bg-[#2D6A4F] hover:text-white hover:border-transparent group transition-all cursor-pointer"
            >
              <Leaf size={22} className="text-[#52B788] group-hover:text-white" />
              <span className="text-xs font-bold text-[#1B4332]/80 group-hover:text-white">Sell Waste</span>
            </motion.div>
          </Link>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F4F7F3] border border-[#2D6A4F]/15 hover:bg-[#2D6A4F] hover:text-white hover:border-transparent group transition-all"
          >
            <QrCode size={22} className="text-[#2D6A4F] group-hover:text-white" />
            <span className="text-xs font-bold text-[#1B4332]/80 group-hover:text-white">Scan Bin</span>
          </motion.button>

          <Link to="/citizen/complaints">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#F4F7F3] border border-[#2D6A4F]/15 hover:bg-[#2D6A4F] hover:text-white hover:border-transparent group transition-all cursor-pointer"
            >
              <ClipboardList size={22} className="text-[#2D6A4F] group-hover:text-white" />
              <span className="text-xs font-bold text-[#1B4332]/80 group-hover:text-white">My Complaints</span>
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Recent Complaints */}
      <section className="bg-white rounded-3xl border border-[#2D6A4F]/12 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#2D6A4F]/6">
          <h2 className="text-lg font-black text-[#1B4332]">Recent Complaints</h2>
          <Link
            to="/citizen/complaints"
            className="text-xs font-bold text-[#2D6A4F] hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="p-6 space-y-3">
          {complaintsLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-2xl" />
            ))
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-[#2D6A4F]/30">
              <ClipboardList size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-xs font-bold uppercase tracking-wider">No complaints yet</p>
              <button
                onClick={() => setShowComplaintForm(true)}
                className="mt-4 px-5 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-bold hover:bg-[#1B4332] transition-all"
              >
                File your first complaint
              </button>
            </div>
          ) : (
            complaints.slice(0, 5).map((c, i) => {
              const date = c.createdAt?.toDate?.() || c.created_at?.toDate?.();
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-[#F4F7F3] border border-transparent hover:border-[#95D5B2]/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#95D5B2]/15 flex items-center justify-center text-[#2D6A4F]">
                      <ClipboardList size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#1B4332] text-sm">{c.description || c.type || 'Complaint'}</p>
                      <p className="text-xs text-[#2D6A4F]/50 flex items-center gap-1.5 mt-0.5">
                        <MapPin size={10} />
                        {c.location || c.ward_id || 'No location'}
                        {date && <> · <Clock size={10} /> {date.toLocaleDateString('en-IN')}</>}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${STATUS_STYLES[c.status] || 'bg-gray-50 text-gray-500'}`}>
                    {c.status}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Impact card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-[#1B4332] to-[#2D6A4F] rounded-3xl p-7 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <TrendingUp size={26} className="text-[#95D5B2]" />
          </div>
          <div>
            <h3 className="text-xl font-black">Your Environmental Impact</h3>
            <p className="text-white/60 text-sm mt-0.5">
              {resolved} issues resolved · {listings.length} waste listings · {userProfile?.points || 0} civic points earned
            </p>
          </div>
        </div>
        <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((resolved / 10) * 100, 100)}%` }}
            transition={{ duration: 1, delay: 0.5 }}
            className="h-full bg-[#95D5B2] rounded-full"
          />
        </div>
        <p className="text-[10px] font-bold text-[#95D5B2] uppercase tracking-[0.2em] mt-2">
          {resolved} of 10 monthly goal
        </p>
      </motion.div>

      {/* New complaint modal */}
      <AnimatePresence>
        {showComplaintForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowComplaintForm(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#2D6A4F] to-[#95D5B2]" />
              <button
                onClick={() => setShowComplaintForm(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                <X size={16} />
              </button>

              <h3 className="text-xl font-black text-[#1B4332] mb-1">File a Complaint</h3>
              <p className="text-sm text-[#2D6A4F]/50 mb-6">Report a civic issue in your area</p>

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-[#1B4332]/50 uppercase tracking-widest block mb-2">
                    Description *
                  </label>
                  <textarea
                    value={newComplaint.description}
                    onChange={e => setNewComplaint(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe the issue in detail..."
                    rows={3}
                    className="w-full bg-[#F4F7F3] border border-[#2D6A4F]/15 rounded-2xl px-4 py-3 text-sm font-medium text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#1B4332]/50 uppercase tracking-widest block mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newComplaint.location}
                    onChange={e => setNewComplaint(p => ({ ...p, location: e.target.value }))}
                    placeholder="Street / Area / Ward"
                    className="w-full bg-[#F4F7F3] border border-[#2D6A4F]/15 rounded-2xl px-4 py-3 text-sm font-medium text-[#1B4332] focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-[#1B4332]/50 uppercase tracking-widest block mb-2">
                    Photo Proof *
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 bg-[#F4F7F3] border-2 border-dashed border-[#2D6A4F]/15 rounded-2xl cursor-pointer hover:bg-[#2D6A4F]/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {newComplaint.photo ? (
                        <p className="text-xs font-bold text-[#2D6A4F]">{newComplaint.photo.name}</p>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-[#2D6A4F]/40 mb-2" />
                          <p className="text-xs text-[#2D6A4F]/60">Click to upload photo</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) setNewComplaint(p => ({ ...p, photo: file }));
                      }}
                    />
                  </label>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2D6A4F] text-white font-bold text-sm hover:bg-[#1B4332] transition-all disabled:opacity-50 shadow-lg shadow-[#2D6A4F]/20"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Scanner modal */}
      <AnimatePresence>
        {showScanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowScanner(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <div className="relative w-full max-w-lg">
              <CameraQRScanner
                onClose={() => setShowScanner(false)}
                onScan={(bin) => {
                  setShowScanner(false);
                  navigate('/citizen/complaints', { 
                    state: { 
                      openForm: true, 
                      binData: bin 
                    } 
                  });
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
