import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';

// Layout
import DashboardLayout from '../components/layout/DashboardLayout';

// Public Pages
import Landing from '../pages/landing/Landing';
import Login from '../pages/auth/Login';

// Role-based Dashboards (Lazy loading)
const CitizenDashboard = lazy(() => import('../pages/citizen/CitizenDashboard'));
const CitizenComplaints = lazy(() => import('../pages/citizen/CitizenComplaints'));
const CitizenBioWaste = lazy(() => import('../pages/citizen/CitizenBioWaste'));

const OfficerDashboard = lazy(() => import('../pages/officer/OfficerDashboard'));
const QRGenerator = lazy(() => import('../pages/officer/QRGenerator'));
const WorkerAnalytics = lazy(() => import('../pages/officer/WorkerAnalytics'));
const Complaints = lazy(() => import('../pages/Complaints'));
const SmartBins = lazy(() => import('../pages/SmartBins'));

const WorkerDashboard = lazy(() => import('../pages/worker/WorkerDashboard'));

// Shared
const Settings = lazy(() => import('../pages/Settings'));

/**
 * RoleRedirect Component
 * Redirects authenticated users to their specific dashboard
 */
function RoleRedirect() {
  const { userRole, loading } = useAuth();
  if (loading) return null;
  const map = { citizen: '/citizen', worker: '/worker', officer: '/officer' };
  return <Navigate to={map[userRole] || '/citizen'} replace />;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#F8FAF5]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700"></div>
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Citizen Routes */}
        <Route
          path="/citizen/*"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <DashboardLayout>
                <Routes>
                  <Route index element={<CitizenDashboard />} />
                  <Route path="complaints" element={<CitizenComplaints />} />
                  <Route path="bio-waste" element={<CitizenBioWaste />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/citizen" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Officer Routes */}
        <Route
          path="/officer/*"
          element={
            <ProtectedRoute allowedRoles={['officer']}>
              <DashboardLayout>
                <Routes>
                  <Route index element={<OfficerDashboard />} />
                  <Route path="complaints" element={<Complaints />} />
                  <Route path="qr-generator" element={<QRGenerator />} />
                  <Route path="worker-analytics" element={<WorkerAnalytics />} />
                  <Route path="smart-bins" element={<SmartBins />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/officer" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Worker Routes */}
        <Route
          path="/worker/*"
          element={
            <ProtectedRoute allowedRoles={['worker']}>
              <DashboardLayout>
                <Routes>
                  <Route index element={<WorkerDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/worker" replace />} />
                </Routes>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<RoleRedirect />} />
      </Routes>
    </Suspense>
  );
}
