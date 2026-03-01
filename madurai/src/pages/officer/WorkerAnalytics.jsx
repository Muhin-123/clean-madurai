import { motion } from 'framer-motion';
import { useWorkers, useComplaints } from '../../hooks/useFirebaseData';
import { SkeletonCard } from '../../components/ui/SkeletonLoader';
import EmptyState from '../../components/ui/EmptyState';
import { Users, CheckCircle2, Clock, Star } from 'lucide-react';

export default function WorkerAnalytics() {
  const { workers, loading: wLoading } = useWorkers();
  const { complaints, loading: cLoading } = useComplaints({});

  const loading = wLoading || cLoading;

  const workerStats = workers.map((w) => {
    const assigned = complaints.filter((c) => c.assigned_worker === w.id);
    const resolved = assigned.filter((c) => c.status === 'Resolved');
    const pending = assigned.filter((c) => c.status !== 'Resolved');
    const rate = assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0;
    return { ...w, assigned: assigned.length, resolved: resolved.length, pending: pending.length, rate };
  }).sort((a, b) => b.resolved - a.resolved);

  const totalResolved = complaints.filter((c) => c.status === 'Resolved').length;
  const totalAssigned = complaints.filter((c) => c.assigned_worker).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Worker Analytics</h1>
        <p className="page-subtitle">Performance tracking · Real-time from Firestore</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Workers', value: workers.length, icon: <Users className="w-5 h-5" />, color: 'from-green-600 to-green-500' },
          { label: 'Total Assigned', value: totalAssigned, icon: <Clock className="w-5 h-5" />, color: 'from-green-500 to-green-400' },
          { label: 'Total Resolved', value: totalResolved, icon: <CheckCircle2 className="w-5 h-5" />, color: 'from-civic-green to-lime-500' },
          { label: 'Resolution Rate', value: totalAssigned > 0 ? `${Math.round((totalResolved / totalAssigned) * 100)}%` : '—', icon: <Star className="w-5 h-5" />, color: 'from-lime-500 to-green-500' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass-card p-4">
            <div className={`w-9 h-9 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${color} text-white`}>
              {icon}
            </div>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : workerStats.length === 0 ? (
        <EmptyState title="No workers registered" description="Workers will appear here once they register with the worker role." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workerStats.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[#0F2E1C] font-bold text-lg ${i === 0 ? 'bg-gradient-to-br from-lime-400 to-green-500' :
                  i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                    i === 2 ? 'bg-gradient-to-br from-green-300 to-green-500' :
                      'bg-gradient-to-br from-green-500 to-green-600'
                  }`}>
                  {(w.name || 'W').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-gray-800 dark:text-white truncate">{w.name}</p>
                    {i < 3 && (
                      <span className="text-sm">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{w.ward || 'All wards'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                {[
                  { label: 'Assigned', value: w.assigned, color: 'text-green-400' },
                  { label: 'Resolved', value: w.resolved, color: 'text-lime-400' },
                  { label: 'Pending', value: w.pending, color: 'text-amber-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-white/5 rounded-xl p-2">
                    <p className={`text-lg font-black ${color}`}>{value}</p>
                    <p className="text-[10px] text-gray-400">{label}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className={`font-bold ${w.rate >= 80 ? 'text-civic-green' : w.rate >= 50 ? 'text-alert-amber' : 'text-alert-red'}`}>
                    {w.rate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${w.rate}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className={`h-full rounded-full ${w.rate >= 80 ? 'bg-lime-400' : w.rate >= 50 ? 'bg-amber-400' : 'bg-red-500'}`}
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-lime-400 font-semibold">
                <Star className="w-3 h-3" />
                <span>{w.points || 0} points earned</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
