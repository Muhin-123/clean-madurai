import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * RoleBasedRoute Component
 * Restricts access to specific roles.
 */
export default function RoleBasedRoute({ children, allowedRoles }) {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F3] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-transparent border-t-[#2D6A4F]"
        />
        <p className="text-sm font-semibold text-[#2D6A4F] tracking-widest uppercase">Verifying access...</p>
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    const redirectMap = {
      citizen: '/citizen',
      worker: '/worker',
      officer: '/officer',
    };
    return <Navigate to={redirectMap[userRole] || '/login'} replace />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
