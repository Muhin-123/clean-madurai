import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquareWarning, Clock, CheckCircle2, Trash2,
  Toilet, Leaf, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { useStats } from '../../hooks/useFirebaseData';
import { SkeletonCard } from '../ui/SkeletonLoader';

function useCountUp(target, duration = 1800, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const timer = setTimeout(() => {
      if (target === 0) { setCount(0); return; }
      const steps = 50;
      const increment = target / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= target) { setCount(target); clearInterval(interval); }
        else setCount(Math.floor(current));
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return count;
}

const CARDS = [
  { key: 'complaintsToday', label: 'Complaints Today', icon: MessageSquareWarning, color: 'from-green-600 to-green-500' },
  { key: 'pendingComplaints', label: 'Pending', icon: Clock, color: 'from-amber-500 to-amber-600' },
  { key: 'resolvedToday', label: 'Resolved Today', icon: CheckCircle2, color: 'from-civic-green to-lime-500' },
  { key: 'criticalBins', label: 'Critical Bins >80%', icon: Trash2, color: 'from-red-600 to-red-500' },
  { key: 'toiletComplaints', label: 'Toilet Complaints', icon: Toilet, color: 'from-green-500 to-green-700' },
  { key: 'bioWasteTraded', label: 'Bio-Waste Traded (kg)', icon: Leaf, color: 'from-lime-500 to-green-600' },
];

function StatCard({ card, value, index }) {
  const count = useCountUp(value, 1600, index * 100);
  const { label, icon: Icon, color } = card;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="stat-card group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse-slow" />
      </div>
      <div className="text-3xl font-black text-gray-800 dark:text-white mb-1 group-hover:scale-105 transition-transform origin-left">
        {count.toLocaleString()}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <div className="mt-3 h-1 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / Math.max(value, 100)) * 100, 100)}%` }}
          transition={{ duration: 1.5, delay: index * 0.1 + 0.5 }}
        />
      </div>
    </motion.div>
  );
}

export default function StatCards() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {CARDS.map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {CARDS.map((card, i) => (
        <StatCard key={card.key} card={card} value={stats[card.key] || 0} index={i} />
      ))}
    </div>
  );
}
