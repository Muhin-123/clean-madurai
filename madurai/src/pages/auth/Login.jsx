import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, AlertCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CleanMaduraiLogo from '../../components/logo/CleanMaduraiLogo';
import logoImage from '../../assets/image.png';

const LOGIN_BACKGROUND = logoImage;

/**
 * Login Page Component
 * Handles both login and registration flows
 * Auto-redirects on successful authentication
 */
export default function Login() {
  const { login, register, currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'citizen',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * AUTO-REDIRECT after successful authentication
   * Watches currentUser and userRole
   * Redirects based on user role
   */
  useEffect(() => {
    // If still loading auth state, wait
    if (authLoading) {
      return;
    }

    // If user is authenticated and has a role, redirect to dashboard
    if (currentUser && userRole) {
      const dashboardRoutes = {
        citizen: '/citizen',
        worker: '/worker',
        officer: '/officer',
      };

      const targetRoute = dashboardRoutes[userRole] || '/citizen';
      console.log('🎯 Redirecting authenticated user to:', targetRoute);

      // Small delay for smooth transition
      const timer = setTimeout(() => {
        navigate(targetRoute, { replace: true });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentUser, userRole, authLoading, navigate]);

  /**
   * HANDLE FORM SUBMISSION
   * Validates input and calls login or register functions
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // CLIENT-SIDE VALIDATION
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }

    if (!formData.password) {
      setErrorMessage('Please enter your password');
      return;
    }

    if (mode === 'register') {
      if (!formData.name.trim()) {
        setErrorMessage('Please enter your full name');
        return;
      }
      if (formData.password.length < 6) {
        setErrorMessage('Password must be at least 6 characters');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        // 🔐 LOGIN MODE
        console.log('🔐 Login:', formData.email);
        await login(formData.email, formData.password);
        // AuthContext will handle redirect via useEffect above
        toast.success('Sign in successful!');
      } else {
        // 📝 REGISTER MODE
        console.log('📝 Register:', formData.email, 'as', formData.role);
        await register(
          formData.email,
          formData.password,
          formData.name.trim(),
          formData.role
        );
        // AuthContext will handle redirect via useEffect above
        toast.success('Account created successfully!');
      }
    } catch (err) {
      // Error is already formatted and set in AuthContext
      console.error('❌ Auth error:', err.message);
      setErrorMessage(err.message || 'Authentication failed');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{
        backgroundImage: `url(${LOGIN_BACKGROUND})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Dark overlay for better text contrast, lightened to make image brighter */}
      <div className="absolute inset-0 bg-black/30 backdrop-brightness-110 backdrop-blur-sm"></div>

      {/* Content container - centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CleanMaduraiLogo size={56} />
          </motion.div>
        </div>

        {/* Branding section - visible on all screens */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
            CLEAN MADURAI
          </h1>
          <p className="text-sm lg:text-base text-white/80">
            Smart Waste & Sanitation System
          </p>
          <p className="text-xs text-white/60 mt-2">
            Real-time civic intelligence for a cleaner tomorrow
          </p>
        </motion.div>

        {/* Stats - hidden on small screens */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden sm:flex gap-3 mb-8 justify-center"
        >
          {[
            { label: 'Smart Bins', value: '150+' },
            { label: 'Active Wards', value: '15' },
            { label: 'Citizens', value: '3M+' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 text-center hover:border-civic-green/50 hover:bg-white/15 transition-all"
            >
              <div className="text-lg font-black bg-gradient-to-r from-civic-green to-civic-green bg-clip-text text-transparent">{value}</div>
              <div className="text-[10px] text-white/50 mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join the Clean Madurai initiative'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-2 mb-6 p-1.5 bg-gray-100 dark:bg-white/10 rounded-xl">
            {['login', 'register'].map((tabMode) => (
              <button
                key={tabMode}
                type="button"
                onClick={() => {
                  setMode(tabMode);
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === tabMode
                    ? 'bg-white dark:bg-navy-700 text-civic-green dark:text-civic-green shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                }`}
              >
                {tabMode === 'login' ? (
                  <span className="flex items-center justify-center gap-1.5">
                    <LogIn className="w-4 h-4" /> Sign In
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    <UserPlus className="w-4 h-4" /> Register
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Error message */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700/50 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-green transition-all"
                      placeholder="Your full name"
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                      required={mode === 'register'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: 'citizen', label: '👤 Citizen' },
                        { value: 'worker', label: '🔧 Worker' },
                        { value: 'officer', label: '🏛 Officer' },
                      ].map((roleOption) => (
                        <button
                          key={roleOption.value}
                          type="button"
                          onClick={() =>
                            setFormData((f) => ({ ...f, role: roleOption.value }))
                          }
                          className={`p-3 rounded-xl text-xs text-center border transition-all font-semibold ${
                            formData.role === roleOption.value
                              ? 'border-civic-green bg-green-50 dark:bg-green-500/20 text-civic-green dark:text-civic-green'
                              : 'border-gray-200 dark:border-white/10 bg-white dark:bg-navy-700/50 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-lg mb-0.5">
                            {roleOption.label.split(' ')[0]}
                          </div>
                          <div className="text-[11px]">
                            {roleOption.label.split(' ').slice(1).join(' ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-green transition-all"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, email: e.target.value }))
                }
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 pr-11 rounded-xl bg-gray-50 dark:bg-navy-700/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-civic-green transition-all"
                  placeholder={
                    mode === 'register'
                      ? 'Minimum 6 characters'
                      : 'Enter your password'
                  }
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, password: e.target.value }))
                  }
                  required
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || authLoading}
              whileHover={{ scale: isSubmitting || authLoading ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting || authLoading ? 1 : 0.98 }}
              className="w-full py-3 mt-2 rounded-xl font-bold text-[#0F2E1C] bg-gradient-to-r from-green-400 to-lime-400 hover:from-green-500 hover:to-lime-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl shadow-green-900/30 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                </>
              ) : authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 p-3 bg-green-50 dark:bg-white/5 rounded-xl border border-green-200 dark:border-white/10">
            <p className="text-xs text-gray-600 dark:text-gray-300 text-center">
              🔐 Secured by Firebase Authentication · Role-based access control
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-white/60 text-xs mt-6"
        >
          © 2024 Madurai Smart City Limited. All rights reserved.
        </motion.p>
      </motion.div>
    </div>
  );
}
