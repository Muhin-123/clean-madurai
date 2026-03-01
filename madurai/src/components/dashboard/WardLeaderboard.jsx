import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWards } from '../../hooks/useFirebaseData';
import { SkeletonRow } from '../ui/SkeletonLoader';
import EmptyState from '../ui/EmptyState';

const CONFETTI_COLORS = ['#22C55E', '#A3E635', '#15803D', '#E2E8F0'];

function Confetti({ active }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const p = Array.from({ length: 15 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1}s`,
        duration: `${2 + Math.random() * 2}s`,
        rotation: `${Math.random() * 360}deg`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      }));
      setParticles(p);
    } else {
      setParticles([]);
    }
  }, [active]);

  if (!active || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={{
            left: p.left,
            top: '-10px',
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotation})`,
          }}
        />
      ))}
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1) return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400 to-green-500 shadow-lime-500/50 flex items-center justify-center shadow-lg">
      <Trophy className="w-5 h-5 text-white" />
    </div>
  );
  if (rank === 2) return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/50 flex items-center justify-center shadow-lg">
      <Medal className="w-5 h-5 text-white" />
    </div>
  );
  if (rank === 3) return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 shadow-green-700/50 flex items-center justify-center shadow-lg">
      <Award className="w-5 h-5 text-white" />
    </div>
  );
  return (
    <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center">
      <span className="text-sm font-bold text-gray-500 dark:text-gray-400">#{rank}</span>
    </div>
  );
}

export default function WardLeaderboard() {
  const [showConfetti, setShowConfetti] = useState(true);
  const { wards, loading } = useWards();

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  const HIGHLIGHT_BG = 'bg-lime-500/10 border-lime-500/20';

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative p-5 border-b border-white/10">
        <Confetti active={showConfetti && wards.length > 0} />
        <h2 className="section-title">🏆 Cleanest Ward Leaderboard</h2>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="w-1.5 h-1.5 rounded-full bg-civic-green animate-pulse" />
          <p className="text-xs text-gray-400">Live from Firestore · Auto-updated</p>
        </div>
      </div>
      <div className="p-4 space-y-2 max-h-[450px] overflow-y-auto">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : wards.length === 0 ? (
          <EmptyState
            title="No ward data yet"
            description="Ward scores will appear here once data is added to Firestore."
          />
        ) : (
          <AnimatePresence>
            {wards.map((ward, i) => (
              <motion.div
                key={ward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-white/30 dark:hover:bg-white/5 cursor-pointer
                  ${ward.rank <= 3 ? HIGHLIGHT_BG : ''}`}
              >
                <RankBadge rank={ward.rank} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-800 dark:text-white truncate">{ward.name || ward.id}</span>
                    {ward.change === 'up' && <TrendingUp className="w-3.5 h-3.5 text-civic-green flex-shrink-0" />}
                    {ward.change === 'down' && <TrendingDown className="w-3.5 h-3.5 text-alert-red flex-shrink-0" />}
                    {ward.change === 'same' && <Minus className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${ward.score || 0}%` }}
                      transition={{ duration: 1.2, delay: i * 0.07 + 0.3 }}
                      className={`h-full rounded-full transition-all duration-1000 ${ward.rank === 1 ? 'bg-gradient-to-r from-lime-400 to-green-400 shadow-glow' :
                        ward.rank === 2 ? 'bg-gradient-to-r from-gray-400 to-slate-500' :
                          ward.rank === 3 ? 'bg-gradient-to-r from-green-500 to-green-700' : 'bg-civic-green/20'
                        }`}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-base font-black text-gray-800 dark:text-white">{ward.score || 0}</div>
                  <div className="text-[10px] text-gray-400">/100</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
