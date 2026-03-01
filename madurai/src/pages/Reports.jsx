import { motion } from 'framer-motion';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { chartData } from '../data/mockData';
import { useApp } from '../context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const baseOpts = (dark) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: dark ? '#94a3b8' : '#64748b', font: { family: 'Inter', size: 11 }, boxWidth: 12 } },
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
    x: { grid: { color: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' }, ticks: { color: dark ? '#64748b' : '#94a3b8', font: { size: 11 } } },
  },
  animation: { duration: 1200 },
});

const REPORT_TYPES = [
  { label: 'Monthly Summary', icon: FileText, desc: 'Complete monthly performance report' },
  { label: 'Ward Analysis', icon: TrendingUp, desc: 'Detailed ward-wise breakdown' },
  { label: 'Bin Status Report', icon: FileText, desc: 'Smart bin fill level analysis' },
  { label: 'Bio-Waste Report', icon: FileText, desc: 'Marketplace transaction summary' },
];

export default function Reports() {
  const { darkMode } = useApp();
  const opts = baseOpts(darkMode);
  const noScale = { ...opts, scales: undefined };

  const monthlyData = {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
    datasets: [
      { label: 'Complaints', data: [180, 220, 195, 240, 210, 175], backgroundColor: 'rgba(15,76,129,0.7)', borderRadius: 6, borderSkipped: false },
      { label: 'Resolved', data: [160, 200, 180, 225, 198, 165], backgroundColor: 'rgba(0,168,107,0.7)', borderRadius: 6, borderSkipped: false },
    ],
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Analytics & Reports</h1>
          <p className="page-subtitle">Comprehensive data insights · Export ready</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-civic-green text-white shadow-glow flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>January 2024</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Complaints', value: 1240, change: '+8%', up: true },
          { label: 'Resolution Rate', value: '94%', change: '+3%', up: true },
          { label: 'Avg Response Time', value: '2.4h', change: '-12%', up: true },
          { label: 'Bio-Waste Traded', value: '4.2T', change: '+45%', up: true },
        ].map(({ label, value, change, up }) => (
          <div key={label} className="glass-card p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">{value}</p>
            <p className={`text-xs font-medium ${up ? 'text-civic-green' : 'text-alert-red'}`}>{change} vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="glass-card p-5">
          <h3 className="section-title mb-1">Monthly Complaint Trends</h3>
          <p className="text-xs text-gray-400 mb-4">6-month comparison</p>
          <div className="h-56"><Bar data={monthlyData} options={opts} /></div>
        </div>
        <div className="glass-card p-5">
          <h3 className="section-title mb-1">Weekly Resolution Pattern</h3>
          <p className="text-xs text-gray-400 mb-4">This week</p>
          <div className="h-56"><Line data={chartData.weeklyTrend} options={opts} /></div>
        </div>
        <div className="glass-card p-5">
          <h3 className="section-title mb-1">Complaint Distribution</h3>
          <p className="text-xs text-gray-400 mb-4">By type</p>
          <div className="h-56"><Doughnut data={chartData.complaintTypes} options={{ ...noScale, cutout: '60%' }} /></div>
        </div>
        <div className="glass-card p-5">
          <h3 className="section-title mb-1">Bio-Waste Conversion</h3>
          <p className="text-xs text-gray-400 mb-4">Processing efficiency</p>
          <div className="h-56"><Doughnut data={chartData.bioWaste} options={{ ...noScale, cutout: '60%', plugins: { ...noScale.plugins, legend: { ...noScale.plugins.legend, position: 'right' } } }} /></div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="section-title mb-4">Download Reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {REPORT_TYPES.map(({ label, icon: ReportIcon, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -2 }}
              className="flex flex-col items-start gap-3 p-4 rounded-xl border border-gray-200 dark:border-white/10 hover:border-civic-green dark:hover:border-civic-green hover:bg-civic-green/5 dark:hover:bg-civic-green/5 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-civic-green/10 dark:bg-civic-green/10 flex items-center justify-center">
                <ReportIcon className="w-5 h-5 text-civic-green" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <button className="btn-primary w-full flex items-center justify-center gap-2 mt-auto">
                <Download className="w-4 h-4" /> Export
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
