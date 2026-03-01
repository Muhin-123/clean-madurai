import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus, Star, Loader2 } from 'lucide-react';
import { useWards } from '../hooks/useFirebaseData';

const CONFETTI_COLORS = ['#22C55E', '#A3E635', '#15803D', '#E2E8F0'];

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  top: '-10px',
  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  width: 6 + Math.random() * 8,
  height: 6 + Math.random() * 8,
  animationDelay: `${Math.random() * 2}s`,
  animationDuration: `${2.5 + Math.random() * 2}s`,
  borderRadius: Math.random() > 0.5 ? '50%' : '2px',
}));

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {PARTICLES.map((style, i) => (
        <div
          key={i}
          className="confetti-particle"
          style={style}
        />
      ))}
    </div>
  );
}

function PodiumCard({ ward, pos }) {
  const configs = {
    1: { height: 'h-32', bg: 'from-lime-400 to-green-500', icon: <Trophy className="w-8 h-8 text-white" />, label: '1st', shadow: 'shadow-lime-500/50' },
    2: { height: 'h-24', bg: 'from-slate-300 to-slate-400', icon: <Medal className="w-7 h-7 text-white" />, label: '2nd', shadow: 'shadow-slate-400/50' },
    3: { height: 'h-20', bg: 'from-green-600 to-green-800', icon: <Award className="w-6 h-6 text-white" />, label: '3rd', shadow: 'shadow-green-700/50' },
  };
  const cfg = configs[pos];
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: pos * 0.15, type: 'spring', stiffness: 200 }}
      className="flex flex-col items-center gap-2"
    >
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center ${cfg.shadow}`}>
        {cfg.icon}
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800 dark:text-white">{ward.ward}</p>
        <p className="text-2xl font-black text-gradient">{ward.score}</p>
        <p className="text-[10px] text-gray-400">score</p>
      </div>
      <div className={`w-full ${cfg.height} bg-gradient-to-b ${cfg.bg} rounded-t-xl flex items-end justify-center pb-2`}>
        <span className="text-white font-black text-lg">{cfg.label}</span>
      </div>
    </motion.div>
  );
}

export default function WardRanking() {
  const [confetti, setConfetti] = useState(true);
  const { wards, loading } = useWards();

  useEffect(() => { const t = setTimeout(() => setConfetti(false), 5000); return () => clearTimeout(t); }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-10 h-10 animate-spin text-civic-green" />
    </div>
  );

  const top3 = wards.length >= 3 ? [wards[1], wards[0], wards[2]] : wards;

  const ChangeIcon = ({ change }) => {
    if (change === 'up') return <TrendingUp className="w-4 h-4 text-civic-green" />;
    if (change === 'down') return <TrendingDown className="w-4 h-4 text-alert-red" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="page-title">Ward Ranking & Leaderboard</h1>
        <p className="page-subtitle">Cleanest wards ranked by performance score · Real-time from Firestore</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Wards', value: wards.length, color: 'from-lime-400 to-green-500' },
          { label: 'Avg Score', value: wards.length ? (wards.reduce((a, b) => a + (b.score || 0), 0) / wards.length).toFixed(1) : '0', color: 'from-civic-green to-emerald-600' },
          { label: 'Top Performer', value: wards[0]?.ward || '—', color: 'from-lime-400 to-green-500', text: true },
        ].map(({ label, value, color, text }) => (
          <div key={label} className="glass-card p-4 text-center">
            <div className={`${text ? 'text-lg' : 'text-3xl'} font-black bg-gradient-to-r ${color} bg-clip-text text-transparent mb-1`}>{value}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {wards.length > 0 && (
        <div className="glass-card bg-gradient-to-br from-[#174C2F] to-[#0F2E1C] p-6 mb-8 relative overflow-hidden">
          {confetti && <Confetti />}
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-green-500/10 rounded-full -ml-12 -mb-12 blur-2xl" />
          <h2 className="section-title text-center mb-6">🏆 Top Cleanest Wards</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            {top3.map((ward, i) => <PodiumCard key={ward.id} ward={ward} pos={top3.length === 3 ? (i === 0 ? 2 : i === 1 ? 1 : 3) : i + 1} />)}
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <h2 className="section-title">Full Rankings</h2>
        </div>
        <div className="divide-y divide-white/5">
          {wards.map((ward, i) => (
            <motion.div
              key={ward.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 hover:bg-white/20 dark:hover:bg-white/5 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg
                ${ward.rank === 1 ? 'bg-gradient-to-br from-lime-400 to-green-500 text-white shadow-lg' :
                  ward.rank === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg' :
                    ward.rank === 3 ? 'bg-gradient-to-br from-green-600 to-green-800 text-white shadow-lg' :
                      'bg-white dark:bg-white/10 text-gray-600 dark:text-gray-400 text-base'}`}>
                {ward.rank <= 3 ? (ward.rank === 1 ? '🥇' : ward.rank === 2 ? '🥈' : '🥉') : `#${ward.rank}`}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-gray-800 dark:text-white text-sm">{ward.ward}</span>
                  <ChangeIcon change={ward.change} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{ward.complaints || 0} complaints</span>
                  <span>Cleanliness: {ward.cleanliness || 0}%</span>
                  <span>Response: {ward.response || 0}%</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${ward.score || 0}%` }}
                    transition={{ duration: 1.2, delay: i * 0.07 + 0.3 }}
                    className={`h-full rounded-full transition-all duration-1000 ${ward.rank === 1 ? 'bg-gradient-to-r from-lime-400 to-green-400 shadow-glow' :
                      ward.rank === 2 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                        ward.rank === 3 ? 'bg-gradient-to-r from-green-500 to-green-700' : 'bg-civic-green/20'
                      }`}
                  />
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl font-black text-gray-800 dark:text-white">{ward.score || 0}</div>
                <div className="text-[10px] text-gray-400">/ 100</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
