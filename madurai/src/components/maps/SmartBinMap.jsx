import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useBins } from '../../hooks/useFirebaseData';
import { SkeletonChart } from '../ui/SkeletonLoader';

const MAP_W = 600, MAP_H = 380;

function latLngToXY(lat, lng) {
  const latMin = 9.9050, latMax = 9.9500;
  const lngMin = 78.0900, lngMax = 78.1400;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * MAP_W;
  const y = MAP_H - ((lat - latMin) / (latMax - latMin)) * MAP_H;
  return { x: Math.max(20, Math.min(MAP_W - 20, x)), y: Math.max(20, Math.min(MAP_H - 20, y)) };
}

function fillColorHex(fill) {
  if (fill > 80) return '#DC2626';
  if (fill >= 50) return '#84CC16';
  return '#16A34A';
}

function BinMarker({ bin, onClick }) {
  if (!bin.lat || !bin.lng) return null;
  const { x, y } = latLngToXY(bin.lat, bin.lng);
  const isCritical = bin.fill > 80;

  return (
    <g onClick={() => onClick(bin)} style={{ cursor: 'pointer' }}>
      {isCritical && (
        <>
          <circle cx={x} cy={y} r="18" fill="#22C55E33">
            <animate attributeName="r" values="8;22" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      <circle cx={x} cy={y} r="10" fill={fillColorHex(bin.fill)} stroke="white" strokeWidth="2" className="shadow-lg" />
      <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="black" className="pointer-events-none">{bin.fill}%</text>
    </g>
  );
}

function InfoPanel({ bin, onClose }) {
  const isCritical = bin.fill > 80;
  const isWarning = bin.fill >= 50 && bin.fill <= 80;
  const statusColor = isCritical ? 'text-alert-red' : isWarning ? 'text-lime-500' : 'text-green-500';
  const fillColorClass = isCritical ? 'bg-alert-red' : isWarning ? 'bg-lime-500' : 'bg-green-500';

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute top-0 right-0 bottom-0 w-64 glass-card rounded-l-2xl rounded-r-none p-5 z-10 overflow-y-auto"
    >
      <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/20 text-gray-400">
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-civic-green to-civic-green flex items-center justify-center">
          <Trash2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">{bin.id}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{bin.ward}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500 dark:text-gray-400">Fill Level</span>
            <span className={`font-bold ${statusColor}`}>{bin.fill}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
              <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bin.fill}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full rounded-full ${fillColorClass}`}
            />
          </div>
        </div>
        {[
          { icon: MapPin, label: 'Ward', value: bin.ward || 'N/A' },
          { icon: Clock, label: 'Last Cleaned', value: bin.last_cleaned || 'N/A' },
          { icon: AlertTriangle, label: 'Status', value: bin.status || 'Good' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 dark:text-gray-400">{label}:</span>
            <span className={`font-medium ${label === 'Status' ? statusColor : 'text-gray-800 dark:text-white'}`}>{value}</span>
          </div>
        ))}
        {isCritical && (
          <div className="mt-2 p-2 bg-alert-red/10 border border-alert-red/20 rounded-xl text-xs text-alert-red font-medium flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            Immediate collection required!
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function SmartBinMap() {
  const [selected, setSelected] = useState(null);
  const { bins, loading } = useBins();

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/10">
          <div className="w-40 h-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
        <SkeletonChart height={380} />
      </div>
    );
  }

  const critical = bins.filter((b) => b.fill > 80).length;
  const warning = bins.filter((b) => b.fill >= 50 && b.fill <= 80).length;

  function fillColorHex(fill) {
    if (fill > 80) return '#DC2626';
    if (fill >= 50) return '#84CC16';
    return '#16A34A';
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="section-header p-5 border-b border-white/10">
        <div>
          <h2 className="section-title">Live Smart Bin Map</h2>
          <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-alert-red inline-block" />{critical} critical</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-lime-500 inline-block" />{warning} warning</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-civic-green inline-block animate-pulse" />Live RTDB</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          {[{ color: 'bg-civic-green', label: '<50%' }, { color: 'bg-lime-500', label: '50–80%' }, { color: 'bg-alert-red', label: '>80%' }].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1">
              <span className={`w-2.5 h-2.5 rounded-full ${color}`} />{label}
            </span>
          ))}
        </div>
      </div>
      <div className="relative" style={{ height: MAP_H }}>
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="w-full h-full bg-gradient-to-br from-[#0F2E1C]/5 to-[#174C2F]/5 dark:from-green-900/10 dark:to-green-950/20"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(15,76,129,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <text x={MAP_W / 2} y={MAP_H / 2} textAnchor="middle" fill="rgba(15,76,129,0.05)" fontSize="80" fontWeight="900">MADURAI</text>
          {bins.map((bin) => (
            <BinMarker key={bin.id} bin={bin} onClick={setSelected} />
          ))}
        </svg>
        <AnimatePresence>
          {selected && <InfoPanel bin={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
        <div className="absolute bottom-3 left-3 text-xs text-gray-400 dark:text-gray-500 bg-white/60 dark:bg-navy-800/60 backdrop-blur-sm px-2 py-1 rounded-lg">
          📍 Madurai, Tamil Nadu · {bins.length} bins monitored
        </div>
      </div>
    </div>
  );
}
