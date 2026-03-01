import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin, Clock, X, Loader2, CheckCircle2, Toilet } from 'lucide-react';
import { mockToiletComplaints, WARDS } from '../data/mockData';

const ISSUE_TYPES = ['Not Cleaned', 'Water Supply Issue', 'Broken Door', 'Stink Issue', 'Light Not Working', 'Sanitary Supplies Missing', 'Drainage Blocked', 'Other'];
const STATUS_BADGE = { Pending: 'badge-amber', 'In Progress': 'badge-blue', Resolved: 'badge-green' };

function IssueForm({ onClose }) {
  const [form, setForm] = useState({ location: '', issue: '', ward: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [id] = useState(() => `TC${String(Date.now()).slice(-4)}`);

  const submit = () => {
    if (!form.location || !form.issue || !form.ward) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 1800);
  };

  if (done) return (
    <div className="text-center py-6">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
        <div className="w-16 h-16 rounded-full bg-civic-green/10 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-8 h-8 text-civic-green" />
        </div>
      </motion.div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Issue Reported!</h3>
      <p className="text-xs text-gray-400 mb-3">Tracking ID: <span className="font-mono font-bold text-civic-green dark:text-civic-green">{id}</span></p>
      <button onClick={onClose} className="btn-primary">Close</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Toilet Location *</label>
        <input className="input-field" placeholder="e.g. Meenakshi Temple Bus Stop" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Issue Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {ISSUE_TYPES.map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, issue: t }))}
              className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all ${form.issue === t ? 'border-civic-green dark:border-civic-green bg-civic-green/10 dark:bg-civic-green/10 text-civic-green dark:text-civic-green' : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Ward *</label>
        <select className="input-field" value={form.ward} onChange={e => setForm(f => ({ ...f, ward: e.target.value }))}>
          <option value="">Select Ward</option>
          {WARDS.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Notes</label>
        <textarea className="input-field resize-none" rows={3} placeholder="Any additional details..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <button onClick={submit} disabled={!form.location || !form.issue || !form.ward || submitting}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
        {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : '✓ Report Issue'}
      </button>
    </div>
  );
}

export default function ToiletIssues() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = mockToiletComplaints.filter(c => {
    const matchSearch = c.location.toLowerCase().includes(search.toLowerCase()) || c.issue.toLowerCase().includes(search.toLowerCase());
    return filter === 'All' ? matchSearch : matchSearch && c.status === filter;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Toilet Issue Tracker</h1>
          <p className="page-subtitle">Public sanitation facility complaints · {mockToiletComplaints.filter(c => c.status === 'Pending').length} pending</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Report Issue
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Reported', value: mockToiletComplaints.length, color: 'from-civic-green to-green-600' },
          { label: 'Pending', value: mockToiletComplaints.filter(c => c.status === 'Pending').length, color: 'from-green-600 to-green-500' },
          { label: 'Resolved Today', value: mockToiletComplaints.filter(c => c.status === 'Resolved').length, color: 'from-civic-green to-emerald-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by location or issue..." className="input-field pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'In Progress', 'Resolved'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${filter === f ? 'bg-civic-green dark:bg-civic-green text-white' : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filtered.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-civic-green/10 flex items-center justify-center flex-shrink-0">
                  <Toilet className="w-5 h-5 text-civic-green" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{c.id}</span>
                    <span className={STATUS_BADGE[c.status]}>{c.status}</span>
                  </div>
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.location}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Issue: {c.issue}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin className="w-3 h-3" />{c.ward}</span>
                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{c.time}</span>
                  </div>
                </div>
              </div>
              {c.status !== 'Resolved' && (
                <button className="text-xs px-3 py-1.5 rounded-lg bg-civic-green/10 text-civic-green dark:bg-civic-green/10 dark:text-civic-green font-medium">
                  Update
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="glass-card w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <Toilet className="w-5 h-5 text-civic-green dark:text-civic-green" /> Report Toilet Issue
                </h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-white/20 text-gray-400"><X className="w-5 h-5" /></button>
              </div>
              <IssueForm onClose={() => setShowForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
