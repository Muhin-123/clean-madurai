import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, MapPin, Clock, X } from 'lucide-react';
import { useBins } from '../hooks/useFirebaseData';
import { SkeletonCard } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

const STATUS_CONFIG = {
  Critical: { color: 'text-alert-red', bg: 'bg-alert-red/10', border: 'border-alert-red/30', badge: 'badge-red' },
  Warning: { color: 'text-lime-500', bg: 'bg-lime-500/10', border: 'border-lime-500/30', badge: 'badge-amber' },
  Good: { color: 'text-civic-green', bg: 'bg-civic-green/10', border: 'border-civic-green/30', badge: 'badge-green' },
};

const MAP_W = 700, MAP_H = 420;
const LAT_MIN = 9.905, LAT_MAX = 9.950, LNG_MIN = 78.09, LNG_MAX = 78.14;

function latLngToXY(lat, lng) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * MAP_W;
  const y = MAP_H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * MAP_H;
  return { x: Math.max(20, Math.min(MAP_W - 20, x)), y: Math.max(20, Math.min(MAP_H - 20, y)) };
}

const fillColor = (fill) => {
  if (fill > 80) return 'bg-alert-red';
  if (fill >= 50) return 'bg-lime-500';
  return 'bg-civic-green';
};

export default function SmartBins() {
  const { bins, loading } = useBins();
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('grid');

  const filtered = filter === 'All' ? bins : bins.filter((b) => b.status === filter);

  const counts = {
    All: bins.length,
    Critical: bins.filter((b) => b.status === 'Critical').length,
    Warning: bins.filter((b) => b.status === 'Warning').length,
    Good: bins.filter((b) => b.status === 'Good').length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Smart Bin Monitoring</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-civic-green animate-pulse" />
            <p className="page-subtitle mb-0">Real-time Firebase RTDB · {bins.length} bins online</p>
          </div>
        </div>
        <button
          onClick={() => setView(view === 'grid' ? 'map' : 'grid')}
          className="btn-secondary text-sm"
        >
          {view === 'grid' ? '🗺 Map View' : '⊞ Grid View'}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {Object.entries(counts).map(([status, count]) => (
          <button key={status} onClick={() => setFilter(status)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter === status ? 'bg-civic-green dark:bg-civic-green text-white shadow-glow' : 'glass-card text-gray-600 dark:text-gray-400'
              }`}>
            <span className={`w-2 h-2 rounded-full ${status === 'Critical' ? 'bg-alert-red' : status === 'Warning' ? 'bg-lime-500' : status === 'Good' ? 'bg-civic-green' : 'bg-gray-400'}`} />
            {status} <span className="font-bold">{count}</span>
          </button>
        ))}
      </div>

      {view === 'map' && bins.length > 0 && (
        <div className="glass-card overflow-hidden mb-6">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="section-title">Live Bin Map</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-civic-green inline-block" /> Good</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-lime-500 inline-block" /> Warning</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-alert-red inline-block" /> Critical</span>
            </div>
          </div>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="w-full bg-gradient-to-br from-slate-100 to-green-50 dark:from-navy-800 dark:to-navy-900">
            <defs>
              <pattern id="mapgrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(15,76,129,0.06)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mapgrid)" />
            <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" fill="rgba(15,76,129,0.04)" fontSize="90" fontWeight="900">MADURAI</text>
            {filtered.filter((b) => b.lat && b.lng).map((bin) => {
              const { x, y } = latLngToXY(bin.lat, bin.lng);
              const isCrit = bin.status === 'Critical';
              const color = isCrit ? '#E53935' : bin.status === 'Warning' ? '#3B82F6' : '#10B981';
              return (
                <g key={bin.id} onClick={() => setSelected(bin)} style={{ cursor: 'pointer' }}>
                  {isCrit && (
                    <circle cx={x} cy={y} r={20} fill={color} opacity={0.15}>
                      <animate attributeName="r" values="16;24;16" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={x} cy={y} r={selected?.id === bin.id ? 13 : 11} fill={bin.status === 'Critical' ? '#E53935' : bin.status === 'Warning' ? '#A3E635' : '#22C55E'} stroke="white" strokeWidth={2} />
                  <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">{bin.fill}%</text>
                </g>
              );
            })}
          </svg>
        </div>
      )
      }

      {
        loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No bins found" description="No bins match the selected filter." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((bin, i) => {
              const cfg = STATUS_CONFIG[bin.status] || STATUS_CONFIG.Good;
              return (
                <motion.div
                  key={bin.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelected(selected?.id === bin.id ? null : bin)}
                  className={`glass-card p-4 cursor-pointer border ${cfg.border} transition-all hover:scale-[1.02] ${bin.status === 'Critical' ? 'animate-glow-red' : ''}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center`}>
                      <Trash2 className={`w-5 h-5 ${cfg.color}`} />
                    </div>
                    <span className={cfg.badge}>{bin.status}</span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-mono text-gray-500 dark:text-gray-400">{bin.id}</span>
                      <span className={`font-bold ${cfg.color}`}>{bin.fill ?? '—'}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${bin.fill ?? 0}%` }}
                        transition={{ duration: 1, delay: i * 0.05 }}
                        className={`h-full rounded-full ${fillColor(bin.fill ?? 0)}`}
                      />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white mb-1">{bin.ward || bin.location || '—'}</p>
                  {bin.last_cleaned && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Cleaned: {bin.last_cleaned}</span>
                    </div>
                  )}
                  {bin.lid_open && (
                    <div className="mt-2 text-xs text-lime-500 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Lid Open
                    </div>
                  )}
                  {bin.status === 'Critical' && (
                    <button className="mt-3 w-full py-1.5 rounded-xl bg-alert-red text-white text-xs font-semibold hover:bg-alert-red/90 transition-colors">
                      🚨 Assign Collection
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )
      }

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card w-full max-w-sm p-6 relative"
            >
              <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/20 text-gray-400"><X className="w-4 h-4" /></button>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.Good).bg} flex items-center justify-center`}>
                  <Trash2 className={`w-6 h-6 ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.Good).color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-white">{selected.id}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.ward || selected.location || '—'}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Fill Level</span>
                  <span className={`font-bold ${(STATUS_CONFIG[selected.status] || STATUS_CONFIG.Good).color}`}>{selected.fill ?? '—'}%</span>
                </div>
                <div className="h-3 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${selected.fill ?? 0}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full rounded-full ${fillColor(selected.fill ?? 0)}`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                {[
                  { label: 'Status', value: selected.status },
                  { label: 'Lid', value: selected.lid_open ? 'Open ⚠' : 'Closed ✓' },
                  { label: 'Last Cleaned', value: selected.last_cleaned || '—' },
                  { label: 'Location', value: selected.lat ? `${selected.lat?.toFixed?.(4)}, ${selected.lng?.toFixed?.(4)}` : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/30 dark:bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="font-semibold text-gray-800 dark:text-white text-xs">{value}</p>
                  </div>
                ))}
              </div>
              {selected.lat && (
                <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{selected.lat?.toFixed?.(4)}, {selected.lng?.toFixed?.(4)}</span>
                </div>
              )}
              <button className="btn-primary w-full text-sm py-2.5">Assign Collection Vehicle</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div >
  );
}
