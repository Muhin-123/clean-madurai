import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStats } from '../../hooks/useFirebaseData';
import { useBins } from '../../hooks/useFirebaseData';

function useCountUp(target, duration = 2000, delay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const timer = setTimeout(() => {
      if (target === 0) { setCount(0); return; }
      const steps = 60;
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

// Generate particles once per component mount to avoid impure calls in render

export default function HeroSection() {
  const { stats } = useStats();
  const { bins } = useBins();

  const totalBins = bins.length;
  const onlineBins = bins.filter((b) => b.fill !== undefined).length;

  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const gen = Array.from({ length: 20 }, (_, i) => ({
      width: 4 + Math.random() * 12,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: 4 + Math.random() * 4,
      delay: Math.random() * 2,
      bg: i % 3 === 0 ? '#22C55E' : i % 3 === 1 ? '#A3E635' : '#15803D',
    }));
    setParticles(gen);
  }, []);

  const complaintsToday = useCountUp(stats.complaintsToday, 1500, 300);
  const activeBinsCount = useCountUp(onlineBins || 0, 2000, 500);
  const criticalAlerts = useCountUp(stats.criticalBins, 1200, 700);

  const heroStats = [
    { label: 'Total Complaints Today', value: complaintsToday, suffix: '', color: 'from-green-400 to-green-600' },
    { label: 'Active Smart Bins', value: activeBinsCount, suffix: totalBins ? `/${totalBins}` : '', color: 'from-lime-400 to-emerald-500' },
    { label: 'Critical Alerts', value: criticalAlerts, suffix: '', color: 'from-red-500 to-lime-500' },
  ];

  return (
    <div className="relative hero-gradient rounded-3xl overflow-hidden mb-6 shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-lime-500/10"
            style={{ width: p.width, height: p.width, left: p.left, top: p.top }}
            animate={{ y: [0, -30, 0], x: [0, 15, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
        <div className="absolute inset-0 bg-grid-dark opacity-30" />
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-10" viewBox="0 0 1200 200" preserveAspectRatio="none">
          <path d="M0,200 L0,120 L50,110 L80,90 L120,85 L150,70 L170,60 L200,55 L220,65 L240,50 L270,40 L300,45 L320,35 L340,20 L360,25 L380,30 L400,15 L420,20 L440,10 L460,25 L480,30 L500,20 L530,35 L560,25 L580,40 L600,35 L630,50 L660,45 L680,55 L700,60 L720,70 L750,65 L780,80 L810,75 L840,90 L870,85 L900,100 L930,95 L960,110 L990,105 L1020,115 L1050,120 L1080,130 L1110,125 L1140,140 L1170,135 L1200,150 L1200,200 Z" fill="white" />
        </svg>
        {/* Stylized gopuram silhouette watermark */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none select-none">
          <svg viewBox="0 0 200 160" width="200" height="160">
            <rect x="90" y="140" width="20" height="15" fill="white" />
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <rect key={i} x={80 + i * 2} y={140 - (i + 1) * 16} width={40 - i * 4} height={14} rx="1" fill="white" />
            ))}
            <ellipse cx="100" cy="16" rx="6" ry="8" fill="white" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-civic-green animate-pulse" />
            <span className="text-civic-green text-sm font-semibold tracking-wider uppercase">Live Command Center</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight">
            CLEAN MADURAI
            <span className="block text-lg lg:text-xl font-medium text-white/70 mt-1">
              Smart Waste & Sanitation System
            </span>
          </h1>
          <p className="text-white/50 text-sm mt-2">Madurai Smart City Limited · Real-time civic intelligence</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {heroStats.map(({ label, value, suffix, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/20 transition-all"
            >
              <p className="text-white/60 text-xs font-medium mb-1">{label}</p>
              <div className={`text-3xl font-black bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                {value.toLocaleString()}<span className="text-xl text-white/50">{suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
