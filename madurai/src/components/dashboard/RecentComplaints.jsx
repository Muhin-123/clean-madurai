import { motion } from 'framer-motion';
import { MapPin, Clock, ExternalLink } from 'lucide-react';
import { useComplaints } from '../../hooks/useFirebaseData';
import { Link } from 'react-router-dom';
import { SkeletonRow } from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';
import { format } from 'date-fns';

const STATUS_BADGE = {
  Pending: 'badge-amber',
  'In Progress': 'badge-amber',
  Resolved: 'badge-green',
};
const PRIORITY_BADGE = { High: 'badge-red', Medium: 'badge-amber', Low: 'badge-green' };

function formatTime(ts) {
  if (!ts) return '—';
  try {
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return format(date, 'hh:mm a');
  } catch {
    return '—';
  }
}

export default function RecentComplaints() {
  const { complaints, loading } = useComplaints({ limitN: 8 });

  return (
    <div className="glass-card">
      <div className="section-header p-5 border-b border-white/10">
        <div>
          <h2 className="section-title">Recent Complaints</h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-civic-green animate-pulse" />
            <p className="text-xs text-gray-400">Real-time from Firestore</p>
          </div>
        </div>
        <Link to="/complaints" className="btn-secondary text-sm flex items-center gap-1">
          View All <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="divide-y divide-white/5">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} className="px-5" />)}
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints yet"
          description="Complaints filed by citizens will appear here in real-time."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {['ID', 'Type', 'Ward', 'Status', 'Priority', 'Time'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-5 py-3 text-xs font-mono text-civic-green dark:text-civic-green">{c.id.slice(0, 8)}</td>
                  <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{c.type || 'General'}</td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3 h-3" />{c.ward_id || '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={STATUS_BADGE[c.status] || 'badge-blue'}>{c.status || 'Pending'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={PRIORITY_BADGE[c.priority] || 'badge-amber'}>{c.priority || 'Medium'}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />{formatTime(c.created_at)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
