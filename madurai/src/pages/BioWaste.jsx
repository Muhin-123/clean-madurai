import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Leaf, MapPin, Phone, X, Loader2, Wind, Camera } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebase/firestore';
import { storage } from '../firebase/storage';
import { useAuth } from '../context/AuthContext';
import { useBioWaste } from '../hooks/useFirebaseData';
import { WARDS, BIO_WASTE_TYPES } from '../utils/constants';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const BIO_TYPES = ['All', ...BIO_WASTE_TYPES];
const CATEGORY_COLORS = {
  'Organic Food': 'badge-green',
  'Garden Waste': 'badge-green',
  'Jasmine': 'badge-green',
  'Rose': 'badge-green', // Assuming Rose also becomes badge-green
  'Temple Flowers': 'badge-green',
  'Banana Leaves': 'badge-green', // Assuming Banana Leaves also becomes badge-green
  'Coconut Shell': 'badge-amber', // Assuming Coconut Shell becomes badge-amber
  'Vegetable Waste': 'badge-green', // Assuming Vegetable Waste also becomes badge-green
  'Other': 'badge-amber'
};

function ListingForm({ onClose }) {
  const { userProfile } = useAuth();
  const [form, setForm] = useState({
    type: '',
    weight_kg: '',
    price_per_kg: '',
    location: '',
    contact: '',
    photo: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setForm((f) => ({ ...f, photo: file }));
  };

  const submit = async () => {
    if (!form.type || !form.weight_kg || !form.location) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (form.photo) {
        const fileRef = storageRef(storage, `bio_waste/${Date.now()}_${form.photo.name}`);
        await uploadBytes(fileRef, form.photo);
        photoUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'bio_waste_market'), {
        seller_id: userProfile?.uid,
        seller_name: userProfile?.name || 'Seller',
        type: form.type,
        weight_kg: parseFloat(form.weight_kg),
        price_per_kg: parseFloat(form.price_per_kg) || 0,
        location: form.location,
        contact: form.contact,
        photo_url: photoUrl,
        status: 'available',
        created_at: serverTimestamp(),
      });

      toast.success('+2 points per kg when sold!');
      setDone(true);
    } catch {
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <div className="w-16 h-16 rounded-full bg-civic-green/10 flex items-center justify-center mx-auto mb-3">
          <Leaf className="w-8 h-8 text-civic-green" />
        </div>
      </motion.div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Listing Created!</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Your bio-waste listing is now live on the marketplace.</p>
      <div className="glass-card p-3 mb-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-400">Est. CO₂ Saved</span>
          <span className="text-civic-green font-bold">~{(parseFloat(form.weight_kg) * 0.25).toFixed(1)} kg</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Points on Sale</span>
          <span className="text-civic-green font-bold">+{Math.floor(parseFloat(form.weight_kg) * 2)} pts</span>
        </div>
      </div>
      <button onClick={onClose} className="btn-primary">Done</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Waste Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {BIO_TYPES.filter((t) => t !== 'All').map((t) => (
            <button
              key={t}
              onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`p-2.5 rounded-xl text-sm font-medium border text-left transition-all ${form.type === t
                ? 'border-civic-green bg-civic-green/10 text-civic-green'
                : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg) *</label>
          <input type="number" className="input-field" placeholder="e.g. 50" value={form.weight_kg} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹/kg)</label>
          <input type="number" className="input-field" placeholder="0 for free" value={form.price_per_kg} onChange={(e) => setForm((f) => ({ ...f, price_per_kg: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
        <input className="input-field" placeholder="Area / landmark" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact Number</label>
        <input className="input-field" placeholder="Phone number" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Photo</label>
        <label className={`flex flex-col items-center justify-center h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${form.photo ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20 hover:border-civic-green'}`}>
          <Camera className={`w-6 h-6 mb-1 ${form.photo ? 'text-civic-green' : 'text-gray-300 dark:text-gray-600'}`} />
          <span className="text-xs text-gray-400">{form.photo ? form.photo.name : 'Upload photo'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>
      </div>
      {form.weight_kg && (
        <div className="glass-card p-3 text-sm flex items-center gap-3">
          <Wind className="w-5 h-5 text-civic-green flex-shrink-0" />
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">Estimated CO₂ Reduction</p>
            <p className="text-civic-green font-bold">~{(parseFloat(form.weight_kg || 0) * 0.25).toFixed(1)} kg CO₂ saved</p>
          </div>
        </div>
      )}
      <button
        onClick={submit}
        disabled={!form.type || !form.weight_kg || !form.location || submitting}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Leaf className="w-4 h-4" /> Post Listing</>}
      </button>
    </div>
  );
}

export default function BioWaste() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [contact, setContact] = useState(null);

  const { listings, loading } = useBioWaste(
    typeFilter !== 'All' ? { type: typeFilter, status: 'available' } : { status: 'available' }
  );

  const filtered = listings.filter((item) => {
    const s = search.toLowerCase();
    return (
      (item.type || '').toLowerCase().includes(s) ||
      (item.location || '').toLowerCase().includes(s) ||
      (item.seller_name || '').toLowerCase().includes(s)
    );
  });

  const totalWaste = listings.reduce((sum, item) => sum + (item.weight_kg || 0), 0);
  const totalCO2 = totalWaste * 0.25;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Bio-Waste Marketplace</h1>
          <p className="page-subtitle">Connect waste sellers with buyers · Circular economy hub</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Listing
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active Listings', value: loading ? '—' : listings.length, color: 'from-civic-green to-green-600', icon: '📦' },
          { label: 'Total Waste (kg)', value: loading ? '—' : totalWaste.toLocaleString(), color: 'from-civic-green to-emerald-600', icon: '🌱' },
          { label: 'CO₂ Saved (kg)', value: loading ? '—' : totalCO2.toFixed(0), color: 'from-alert-purple to-purple-600', icon: '🌍' },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className={`text-2xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search listings..." className="input-field pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {BIO_TYPES.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${typeFilter === t ? 'bg-civic-green dark:bg-civic-green text-white' : 'glass-card text-gray-600 dark:text-gray-400'}`}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No listings found"
          description={search ? `No listings match "${search}"` : 'Be the first to list your bio-waste!'}
          actionLabel="Add Listing"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5 hover:scale-[1.02] hover:shadow-glow-green transition-all"
            >
              {item.photo_url ? (
                <img src={item.photo_url} alt={item.type} className="w-full h-28 object-cover rounded-xl mb-3" />
              ) : (
                <div className="w-full h-28 rounded-xl mb-3 bg-civic-green/10 flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-civic-green/50" />
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[item.type] || 'badge-green'}`}>{item.type}</span>
                <span className="text-xs text-gray-400">{item.created_at?.toDate?.()?.toLocaleDateString?.() || '—'}</span>
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white mb-1 text-sm leading-tight">{item.type} · {item.weight_kg} kg</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{item.seller_name}</p>
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Price</span>
                  <span className="font-bold text-civic-green dark:text-civic-green">
                    {item.price_per_kg === 0 ? 'Free' : `₹${item.price_per_kg}/kg`}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Available</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{item.weight_kg} kg</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />{item.location}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-civic-green font-medium">
                  <Wind className="w-3 h-3" /> CO₂ saved: ~{(item.weight_kg * 0.25).toFixed(1)} kg
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setContact(item)}
                  className="flex-1 py-2 rounded-xl bg-civic-green/10 text-civic-green dark:text-civic-green text-xs font-semibold flex items-center justify-center gap-1 hover:bg-civic-green/20 transition-colors"
                >
                  <Phone className="w-3 h-3" /> Contact
                </button>
                <button className="flex-1 py-2 rounded-xl bg-civic-green text-white text-xs font-semibold hover:bg-civic-green/90 transition-colors">
                  Buy Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {contact && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setContact(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()} className="glass-card w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 dark:text-white">Contact Seller</h3>
                <button onClick={() => setContact(null)} className="p-1.5 rounded-xl hover:bg-white/20 text-gray-400"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="glass-card p-3"><p className="text-xs text-gray-400 mb-0.5">Seller</p><p className="font-semibold text-gray-800 dark:text-white">{contact.seller_name}</p></div>
                <div className="glass-card p-3"><p className="text-xs text-gray-400 mb-0.5">Listing</p><p className="font-semibold text-gray-800 dark:text-white">{contact.type} · {contact.weight_kg} kg</p></div>
                <div className="glass-card p-3"><p className="text-xs text-gray-400 mb-0.5">Location</p><p className="font-semibold text-gray-800 dark:text-white">{contact.location}</p></div>
                {contact.contact && (
                  <div className="glass-card p-3"><p className="text-xs text-gray-400 mb-0.5">Contact</p><p className="font-semibold text-civic-green dark:text-civic-green">{contact.contact}</p></div>
                )}
              </div>
              {contact.contact ? (
                <a href={`tel:${contact.contact}`} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Call Seller
                </a>
              ) : (
                <p className="text-center text-sm text-gray-400 mt-4">No contact number provided</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-civic-green" /> Add Bio-Waste Listing
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-white/20 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <ListingForm onClose={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
