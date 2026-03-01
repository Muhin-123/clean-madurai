import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileNav from './MobileNav';
import { motion } from 'framer-motion';

const PAGE_NAMES = {
  '/': 'Dashboard',
  '/complaints': 'Complaints Management',
  '/toilet-issues': 'Toilet Issue Tracker',
  '/smart-bins': 'Smart Bin Monitoring',
  '/bio-waste': 'Bio-Waste Marketplace',
  '/ward-ranking': 'Ward Ranking & Leaderboard',
  '/reports': 'Analytics & Reports',
  '/settings': 'System Settings',
};

export default function AppShell({ children, pathname }) {
  const { sidebarOpen } = useApp();
  const pageName = PAGE_NAMES[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-navy-800 dark:bg-navy-900 bg-grid dark:bg-grid-dark">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <Topbar pageName={pageName} />
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 lg:p-6 pb-24 lg:pb-6 min-h-[calc(100vh-4rem)]"
        >
          {children}
        </motion.main>
      </div>
      <MobileNav pathname={pathname} />
    </div>
  );
}
