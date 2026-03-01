import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, MessageSquareWarning, Trash2, Leaf, Trophy } from 'lucide-react';

const mobileNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Home' },
  { path: '/complaints', icon: MessageSquareWarning, label: 'Complaints' },
  { path: '/smart-bins', icon: Trash2, label: 'Bins' },
  { path: '/bio-waste', icon: Leaf, label: 'Bio-Waste' },
  { path: '/ward-ranking', icon: Trophy, label: 'Ranking' },
];

export default function MobileNav({ pathname }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-navy-900/95 backdrop-blur-xl border-t border-white/20 dark:border-white/10 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map(({ path, icon: Icon, label }) => {
          const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
          return (
            <NavLink key={path} to={path} className="flex flex-col items-center flex-1">
              <motion.div
                whileTap={{ scale: 0.85 }}
                className={`relative flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-all
                  ${isActive ? 'text-lime-400' : 'text-gray-400'}`}
              >
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      layoutId="active-mobile-tab"
                      className="absolute inset-0 bg-lime-500/10 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
                <div className="relative z-10"> {/* Added relative z-10 to keep icon above background */}
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-lime-500/10' : ''}`} />
                </div>
                <span className="relative z-10 text-[10px] font-medium">{label}</span> {/* Added relative z-10 */}
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
