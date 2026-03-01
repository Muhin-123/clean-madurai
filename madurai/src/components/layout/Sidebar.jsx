import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquareWarning, Toilet, Trash2,
  Leaf, Trophy, BarChart3, Settings, X, QrCode, Users, LogOut,
  ClipboardList, ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import CleanMaduraiLogo from '../logo/CleanMaduraiLogo';

// ─── Role-specific nav items ───────────────────────────────────────────────

const OFFICER_NAV = [
  { path: '/officer', label: 'Control Panel', icon: LayoutDashboard, exact: true },
  { path: '/officer/complaints', label: 'Complaints', icon: MessageSquareWarning },
  { path: '/officer/smart-bins', label: 'Bin Monitoring', icon: Trash2 },
  { path: '/officer/qr-generator', label: 'QR Generator', icon: QrCode },
  { path: '/officer/worker-analytics', label: 'Worker Stats', icon: Users },
  { path: '/officer/settings', label: 'Settings', icon: Settings },
];

const CITIZEN_NAV = [
  { path: '/citizen', label: 'My Hub', icon: LayoutDashboard, exact: true },
  { path: '/citizen/complaints', label: 'My Complaints', icon: MessageSquareWarning },
  { path: '/citizen/bio-waste', label: 'Sell Waste', icon: Leaf },
  { path: '/citizen/settings', label: 'Settings', icon: Settings },
];

const WORKER_NAV = [
  { path: '/worker', label: 'My Tasks', icon: ClipboardList, exact: true },
  { path: '/worker/settings', label: 'Settings', icon: Settings },
];

const NAV_BY_ROLE = { officer: OFFICER_NAV, citizen: CITIZEN_NAV, worker: WORKER_NAV };

// ─── Role color themes ─────────────────────────────────────────────────────

const ROLE_THEME = {
  citizen: {
    accent: '#95D5B2',
    sidebar: 'bg-gradient-to-b from-[#1B4332] to-[#2D6A4F]',
    activeItem: 'bg-[#95D5B2]/20 text-[#95D5B2] border-l-2 border-[#95D5B2]',
    label: 'CITIZEN PORTAL',
    avatar: 'bg-[#2D6A4F] border-[#95D5B2]/40 text-[#95D5B2]',
  },
  worker: {
    accent: '#457B9D',
    sidebar: 'bg-gradient-to-b from-[#0D1B2A] to-[#1D3557]',
    activeItem: 'bg-[#457B9D]/20 text-[#457B9D] border-l-2 border-[#457B9D]',
    label: 'WORKER PORTAL',
    avatar: 'bg-[#1D3557] border-[#457B9D]/40 text-[#457B9D]',
  },
  officer: {
    accent: '#E85D04',
    sidebar: 'bg-gradient-to-b from-[#370617] to-[#6A040F]',
    activeItem: 'bg-[#E85D04]/20 text-[#F48C06] border-l-2 border-[#E85D04]',
    label: 'OFFICER PANEL',
    avatar: 'bg-[#6A040F] border-[#E85D04]/40 text-[#F48C06]',
  },
};

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useApp();
  // CRITICAL FIX: read from userRole (string) NOT userProfile?.role (was undefined)
  const { userProfile, userRole, logout } = useAuth();
  const location = useLocation();

  const role = userRole || 'citizen';
  const navItems = NAV_BY_ROLE[role] || CITIZEN_NAV;
  const theme = ROLE_THEME[role] || ROLE_THEME.citizen;
  const initials = (userProfile?.name?.[0] || userProfile?.email?.[0] || 'U').toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className={`fixed left-0 top-0 h-screen w-72 z-50 flex flex-col shadow-2xl ${theme.sidebar}`}
      >
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <CleanMaduraiLogo size={32} showText={false} />
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-none">
                CLEAN<span className="text-white/50">MADURAI</span>
              </span>
              <span className="text-[9px] font-bold tracking-[0.25em] uppercase" style={{ color: theme.accent }}>
                {theme.label}
              </span>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          {navItems.map(({ path, label, icon: Icon, exact }) => {
            const isActive = exact
              ? location.pathname === path
              : location.pathname.startsWith(path);

            return (
              <NavLink key={path} to={path} onClick={() => { if (window.innerWidth < 1024) toggleSidebar(); }}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? theme.activeItem
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                    }`}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </motion.div>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* User profile */}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border ${theme.avatar}`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{userProfile?.name || 'User'}</p>
              <p className="text-white/40 text-[10px] capitalize">{role}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-500/15 transition-all font-semibold text-sm"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
