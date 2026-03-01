import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Leaf, MapPin, Phone, X, Loader2, Wind, Camera, Search } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import { uploadToSupabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { useBioWaste } from '../../hooks/useFirebaseData';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const BIO_TYPES = ['Jasmine', 'Rose', 'Temple Flowers', 'Banana Leaves', 'Coconut Shell', 'Vegetable Waste'];
const TYPE_COLORS = {
  Jasmine: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  Rose: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Temple Flowers': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Banana Leaves': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  'Coconut Shell': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  'Vegetable Waste': 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
};

export default function CitizenBioWaste() {
  const { userProfile } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('market');
  const [search, setSearch] = useState('');
  const [contact, setContact] = useState(null);
  const [form, setForm] = useState({ type: '', weight_kg: '', price_per_kg: '', location: '', contact: '', photo: null });
  const [submitting, setSubmitting] = useState(false);

  const { listings: market, loading: mLoading } = useBioWaste({ status: 'available' });
  const { listings: myListings, loading: myLoading } = useBioWaste({ sellerId: userProfile?.uid });

  const filteredMarket = market.filter((item) => {
    const s = search.toLowerCase();
    return (item.type || '').toLowerCase().includes(s) || (item.location || '').toLowerCase().includes(s);
  });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) setForm((f) => ({ ...f, photo: file }));
  };

  const submitListing = async () => {
    if (!form.type || !form.weight_kg || !form.location) return;
    setSubmitting(true);
    try {
      let photoUrl = null;
      if (form.photo) {
        photoUrl = await uploadToSupabase(form.photo, 'bio_waste');
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
      toast.success(`Listed! You'll earn +${Math.floor(parseFloat(form.weight_kg) * 2)} points when sold.`);
      setForm({ type: '', weight_kg: '', price_per_kg: '', location: '', contact: '', photo: null });
      setShowForm(false);
      setActiveTab('mine');
    } catch {
      toast.error('Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Bio-Waste Market</h1>
          <p className="page-subtitle">Sell reusable waste · Earn points · Support circular economy</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Sell Waste
        </button>
      </div>

      <div className="flex gap-2 mb-5">
        {[
          { id: 'market', label: `🌿 Marketplace (${market.length})` },
          { id: 'mine', label: `📦 My Listings (${myListings.length})` },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === id ? 'bg-civic-green text-white shadow-glow' : 'glass-card text-gray-600 dark:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'market' && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="input-field pl-9" placeholder="Search by type or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {mLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredMarket.length === 0 ? (
            <EmptyState title="No listings yet" description="Be the first to list your bio-waste!" actionLabel="Sell Waste" onAction={() => setShowForm(true)} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMarket.map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass-card p-4">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.type} className="w-full h-24 object-cover rounded-xl mb-3" />
                  ) : (
                    <div className="w-full h-24 rounded-xl mb-3 bg-civic-green/10 flex items-center justify-center">
                      <Leaf className="w-8 h-8 text-civic-green/40" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || 'badge-green'}`}>{item.type}</span>
                    <span className="text-xs font-bold text-civic-green">{item.price_per_kg === 0 ? 'Free' : `₹${item.price_per_kg}/kg`}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.weight_kg} kg available</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />{item.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-civic-green font-medium mt-1">
                    <Wind className="w-3 h-3" /> ~{(item.weight_kg * 0.25).toFixed(1)} kg CO₂ saved
                  </div>
                  <button onClick={() => setContact(item)}
                    className="mt-3 w-full py-2 rounded-xl bg-green-500/10 text-civic-green text-xs font-semibold flex items-center justify-center gap-1 hover:bg-green-500/20 transition-colors">
                    <Phone className="w-3 h-3" /> Contact Seller
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'mine' && (
        myLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : myListings.length === 0 ? (
          <EmptyState title="No listings yet" description="List your reusable waste to earn points when sold!" actionLabel="Sell Waste" onAction={() => setShowForm(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myListings.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-card p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || 'badge-green'}`}>{item.type}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === 'available' ? 'badge-green' : item.status === 'sold' ? 'badge-blue' : 'badge-amber'}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">{item.weight_kg} kg</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.location}</p>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-gray-400">Price</span>
                  <span className="font-bold text-civic-green dark:text-civic-green">{item.price_per_kg === 0 ? 'Free' : `₹${item.price_per_kg}/kg`}</span>
                </div>
                {item.status === 'sold' && (
                  <div className="mt-3 p-2 bg-civic-green/10 rounded-xl text-xs text-civic-green font-medium">
                    ✓ Sold! +{Math.floor((item.weight_kg || 0) * 2)} points earned
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )
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
                <button onClick={() => setContact(null)}><X className="w-4 h-4 text-gray-400" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="glass-card p-3"><p className="text-xs text-gray-400">Seller</p><p className="font-semibold">{contact.seller_name}</p></div>
                <div className="glass-card p-3"><p className="text-xs text-gray-400">Item</p><p className="font-semibold">{contact.type} · {contact.weight_kg} kg</p></div>
                <div className="glass-card p-3"><p className="text-xs text-gray-400">Location</p><p className="font-semibold">{contact.location}</p></div>
                {contact.contact && <div className="glass-card p-3"><p className="text-xs text-gray-400">Phone</p><p className="font-semibold text-civic-green dark:text-civic-green">{contact.contact}</p></div>}
              </div>
              {contact.contact ? (
                <a href={`tel:${contact.contact}`} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" /> Call Now
                </a>
              ) : (
                <p className="text-center text-sm text-gray-400 mt-4">No contact provided</p>
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
              className="glass-card w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-civic-green" /> Sell Waste
                </h2>
                <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Waste Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BIO_TYPES.map((t) => (
                      <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                        className={`p-2.5 rounded-xl text-sm border text-left transition-all ${form.type === t ? 'border-civic-green bg-civic-green/10 text-civic-green' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg) *</label>
                    <input type="number" className="input-field" placeholder="e.g. 10" value={form.weight_kg} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Price (₹/kg)</label>
                    <input type="number" className="input-field" placeholder="0 = free" value={form.price_per_kg} onChange={(e) => setForm((f) => ({ ...f, price_per_kg: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Location *</label>
                  <input className="input-field" placeholder="Area / landmark" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Contact</label>
                  <input className="input-field" placeholder="Phone number" value={form.contact} onChange={(e) => setForm((f) => ({ ...f, contact: e.target.value }))} />
                </div>
                <label className={`flex flex-col items-center justify-center h-20 border-2 border-dashed rounded-xl cursor-pointer ${form.photo ? 'border-civic-green bg-civic-green/5' : 'border-gray-200 dark:border-white/20'}`}>
                  <Camera className={`w-5 h-5 mb-1 ${form.photo ? 'text-civic-green' : 'text-gray-300'}`} />
                  <span className="text-xs text-gray-400">{form.photo ? form.photo.name : 'Upload photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                </label>
                {form.weight_kg && (
                  <div className="p-3 bg-civic-green/10 border border-civic-green/20 rounded-xl text-xs text-civic-green">
                    ⭐ You'll earn <span className="font-bold">+{Math.floor(parseFloat(form.weight_kg || 0) * 2)} points</span> when this is sold!
                  </div>
                )}
                <button onClick={submitListing} disabled={!form.type || !form.weight_kg || !form.location || submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : <><Leaf className="w-4 h-4" /> Post Listing</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
