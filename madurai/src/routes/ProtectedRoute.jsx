import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ProtectedRoute Component
 * Wraps pages to require authentication + optional role checking.
 * Critical: never redirects while auth is still loading (prevents race condition).
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth();

  // CRITICAL: wait for BOTH auth user AND role to be resolved
  // If we redirect while userRole is null, workers/officers land on citizen dashboard
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F7F3] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-14 h-14 rounded-full border-4 border-transparent border-t-[#2D6A4F]"
          style={{ borderTopColor: '#2D6A4F', borderRightColor: '#95D5B2' }}
        />
        <p className="text-sm font-semibold text-[#2D6A4F] tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  // Not authenticated at all → go to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role check: if role still null after loading (edge case), wait
  if (allowedRoles.length > 0 && userRole === null) {
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

  // Role mismatch → redirect to correct dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    const redirectMap = {
      citizen: '/citizen',
      worker: '/worker',
      officer: '/officer',
    };
    return <Navigate to={redirectMap[userRole] || '/citizen'} replace />;
  }

  // Authorized → render
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
