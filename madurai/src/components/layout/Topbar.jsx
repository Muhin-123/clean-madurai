import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Bell, ChevronDown, User, Settings,
  LogOut, Star, Shield, BadgeCheck, Send,
  AlertTriangle, CheckCircle2, Info, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showLocalNotification } from '../../utils/notifications';

const ROLE_BADGE = {
  citizen: { label: 'Citizen Portal', color: 'bg-[#2D6A4F]/10 text-[#2D6A4F]', icon: BadgeCheck },
  worker: { label: 'Worker Portal', color: 'bg-[#1D3557]/10 text-[#1D3557]', icon: Shield },
  officer: { label: 'Officer Panel', color: 'bg-[#6A040F]/10 text-[#6A040F]', icon: Shield },
};

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Smart Bin Full',
    body: 'Bin #102 in Anna Nagar has reached 85% capacity.',
    time: '5 min ago',
    type: 'alert',
    unread: true
  },
  {
    id: 2,
    title: 'Complaint Resolved',
    body: 'Your garbage overflow report has been fixed.',
    time: '2 hours ago',
    type: 'success',
    unread: false
  },
  {
    id: 3,
    title: 'System Update',
    body: 'New analytics dashboard is now live.',
    time: '1 day ago',
    type: 'info',
    unread: false
  }
];

export default function Topbar() {
  const { toggleSidebar } = useApp();
  const { userProfile, userRole, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTestNotification = () => {
    const newNotif = {
      id: Date.now(),
      title: 'System Test',
      body: 'Service worker and In-App notification test.',
      time: 'Just now',
      type: 'info',
      unread: true
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    
    showLocalNotification('System Test', {
      body: 'Service worker notification is working correctly!',
      tag: 'test-notification'
    });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const role = userRole || 'citizen';
  const badge = ROLE_BADGE[role] || ROLE_BADGE.citizen;
  const firstName = userProfile?.name?.split(' ')[0] || 'User';
  const settingsPath = `/${role}/settings`;
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="h-20 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-2xl bg-white border border-[#B7E4C7]/30 text-[#1B4332] shadow-soft lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h2 className="text-lg md:text-xl font-black text-[#1B4332] tracking-tight truncate max-w-[120px] sm:max-w-none">Welcome, {firstName}</h2>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-bold text-[#2D6A4F]/50 uppercase tracking-widest">Madurai Civic Intelligence</p>
            <span className="text-[10px] text-[#2D6A4F]/30">•</span>
            <p className="text-[10px] font-mono font-bold text-[#2D6A4F]/60">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Test Notification Button */}
        <button
          onClick={handleTestNotification}
          title="Send Test Notification"
          className="p-2.5 rounded-2xl bg-white border border-[#B7E4C7]/30 text-[#2D6A4F] shadow-soft hover:bg-green-50 transition-colors"
        >
          <Send size={18} />
        </button>

        {/* Points for Citizen */}
        {role === 'citizen' && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#B7E4C7]/20 border border-[#B7E4C7]/30">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="text-sm font-black text-[#1B4332]">{userProfile?.points || 0} pts</span>
          </div>
        )}

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-xs ${badge.color}`}
        >
          <badge.icon size={12} />
          <span className="tracking-tight">{badge.label}</span>
        </motion.div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className={`p-2.5 rounded-2xl bg-white border border-[#B7E4C7]/30 text-[#1B4332] shadow-soft relative transition-all ${showNotifications ? 'bg-green-50 ring-2 ring-civic-green/20' : ''}`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-[2rem] border border-[#B7E4C7]/30 shadow-2xl overflow-hidden z-50"
              >
                <div className="p-5 border-b border-[#B7E4C7]/20 flex items-center justify-between bg-[#F8FAF5]/50">
                  <h3 className="font-black text-[#1B4332] flex items-center gap-2">
                    Notifications
                    <span className="px-2 py-0.5 rounded-full bg-[#1B4332] text-white text-[10px]">{unreadCount} New</span>
                  </h3>
                  <button onClick={markAllRead} className="text-[10px] font-bold text-[#2D6A4F] hover:text-[#1B4332] transition-colors">
                    Mark all as read
                  </button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto py-2 custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                      <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                        <Bell size={24} className="opacity-20" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-widest">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`group px-5 py-4 border-b border-[#B7E4C7]/10 last:border-0 hover:bg-[#F8FAF5] transition-all relative cursor-pointer ${n.unread ? 'bg-green-50/30' : ''}`}
                      >
                        <div className="flex gap-4">
                          <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            n.type === 'alert' ? 'bg-rose-100 text-rose-600' :
                            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-sky-100 text-sky-600'
                          }`}>
                            {n.type === 'alert' ? <AlertTriangle size={18} /> :
                             n.type === 'success' ? <CheckCircle2 size={18} /> :
                             <Info size={18} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className={`text-sm font-bold ${n.unread ? 'text-[#1B4332]' : 'text-gray-600'}`}>{n.title}</h4>
                              <button 
                                onClick={(e) => removeNotification(n.id, e)}
                                className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white text-gray-400 transition-all"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">{n.body}</p>
                            <span className="text-[10px] font-bold text-[#2D6A4F]/40 uppercase tracking-tighter">{n.time}</span>
                          </div>
                        </div>
                        {n.unread && (
                          <div className="absolute top-5 right-5 w-2 h-2 bg-civic-green rounded-full shadow-glow" />
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                <button className="w-full py-4 text-xs font-black text-[#1B4332] bg-[#F8FAF5] hover:bg-[#B7E4C7]/20 border-t border-[#B7E4C7]/20 transition-all">
                  VIEW ALL ACTIVITY
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 lg:pl-3 lg:pr-1 rounded-full bg-white border border-[#B7E4C7]/30 shadow-soft hover:shadow-md transition-all"
          >
            <span className="hidden lg:block text-xs font-bold text-[#1B4332]">{firstName}</span>
            <div className="w-8 h-8 rounded-full bg-[#1B4332] flex items-center justify-center text-[#B7E4C7] text-xs font-black">
              {firstName[0].toUpperCase()}
            </div>
            <ChevronDown size={14} className={`text-[#2D6A4F] transition-transform ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-[2rem] border border-[#B7E4C7]/30 shadow-2xl p-3 overflow-hidden"
              >
                <button
                  onClick={() => { setShowProfile(false); navigate(settingsPath); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1B4332] hover:bg-[#F8FAF5] rounded-xl transition-all"
                >
                  <User size={16} /> Profile
                </button>
                <button
                  onClick={() => { setShowProfile(false); navigate(settingsPath); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-[#1B4332] hover:bg-[#F8FAF5] rounded-xl transition-all"
                >
                  <Settings size={16} /> Settings
                </button>
                <div className="my-2 h-px bg-[#B7E4C7]/20 mx-3" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
