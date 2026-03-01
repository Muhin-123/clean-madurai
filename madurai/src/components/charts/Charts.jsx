import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip,
  Legend, Filler,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useChartData } from '../../hooks/useFirebaseData';
import { useApp } from '../../context/AppContext';
import { SkeletonChart } from '../ui/SkeletonLoader';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const baseOptions = (dark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: dark ? '#94a3b8' : '#64748b',
        font: { family: 'Inter', size: 11 },
        boxWidth: 12,
        padding: 12,
      },
    },
    tooltip: {
      backgroundColor: dark ? 'rgba(11,30,51,0.95)' : 'rgba(255,255,255,0.95)',
      titleColor: dark ? '#e2e8f0' : '#1e293b',
      bodyColor: dark ? '#94a3b8' : '#475569',
      borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
    },
  },
  scales: {
    x: { grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }, ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
  },
  animation: { duration: 1200, easing: 'easeOutQuart' },
});

function ChartCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-5"
    >
      <div className="mb-4">
        <h3 className="section-title text-sm">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="h-48">{children}</div>
    </motion.div>
  );
}

export default function Charts() {
  const { darkMode } = useApp();
  const { chartData, loading } = useChartData();
  const opts = baseOptions(darkMode);
  const noScaleOpts = { ...opts, scales: undefined };

  if (loading || !chartData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="mb-4">
              <div className="w-32 h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-1" />
              <div className="w-48 h-3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
            </div>
            <SkeletonChart height={192} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartCard title="Ward Complaint Comparison" subtitle="Live data from Firestore">
        <Bar
          data={chartData.wardComplaints}
          options={{ ...opts, plugins: { ...opts.plugins, legend: { display: false } } }}
        />
      </ChartCard>

      <ChartCard title="Complaint Types" subtitle="Distribution by category">
        <Pie data={chartData.complaintTypes} options={{ ...noScaleOpts }} />
      </ChartCard>

      <ChartCard title="7-Day Trend" subtitle="Complaints filed vs resolved">
        <Line data={chartData.weeklyTrend} options={opts} />
      </ChartCard>

      <ChartCard title="Bio-Waste by Type" subtitle="Listing breakdown from market">
        <Doughnut
          data={chartData.bioWaste}
          options={{
            ...noScaleOpts,
            cutout: '65%',
            plugins: {
              ...noScaleOpts.plugins,
              legend: { ...noScaleOpts.plugins.legend, position: 'right' },
            },
          }}
        />
      </ChartCard>
    </div>
  );
}
