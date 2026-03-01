export function SkeletonCard({ className = '' }) {
  return (
    <div className={`glass-card p-5 animate-pulse ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-white/10" />
        <div className="w-16 h-5 rounded-full bg-gray-200 dark:bg-white/10" />
      </div>
      <div className="w-20 h-8 rounded-lg bg-gray-200 dark:bg-white/10 mb-2" />
      <div className="w-32 h-4 rounded-lg bg-gray-100 dark:bg-white/5" />
      <div className="mt-3 h-1 rounded-full bg-gray-100 dark:bg-white/10" />
    </div>
  );
}

export function SkeletonRow({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-4 animate-pulse ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 rounded-lg bg-gray-200 dark:bg-white/10" />
        <div className="w-1/2 h-3 rounded-lg bg-gray-100 dark:bg-white/5" />
      </div>
      <div className="w-16 h-6 rounded-full bg-gray-200 dark:bg-white/10" />
    </div>
  );
}

import { useState, useEffect } from 'react';

export function SkeletonChart({ height = 192, className = '' }) {
  const [barHeights, setBarHeights] = useState(() => Array.from({ length: 7 }).map(() => '45%'));
  useEffect(() => {
    const heights = Array.from({ length: 7 }).map(() => `${30 + Math.random() * 60}%`);
    setBarHeights(heights);
  }, []);
  return (
    <div
      className={`rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse ${className}`}
      style={{ height }}
    >
      <div className="h-full flex items-end gap-2 p-4">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 dark:bg-white/10 rounded-t-md"
            style={{ height: h }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-gray-200 dark:bg-white/10"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const components = { card: SkeletonCard, row: SkeletonRow, chart: SkeletonChart, text: SkeletonText };
  const Component = components[type] || SkeletonCard;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </>
  );
}
