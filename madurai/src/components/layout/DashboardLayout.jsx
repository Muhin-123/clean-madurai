import { useApp } from '../../context/AppContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export default function DashboardLayout({ children }) {
    const { sidebarOpen } = useApp();
    const location = useLocation();

    return (
        <div className="min-h-screen bg-[#F8FAF5] font-sans antialiased">
            <Sidebar />

            <div className={`transition-all duration-500 ease-in-out ${sidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
                <Topbar />

                <main className="p-4 md:p-8 lg:p-10 max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
