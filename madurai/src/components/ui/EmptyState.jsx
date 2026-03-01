import { motion } from 'framer-motion';

export default function EmptyState({
  icon: Icon,
  title = 'No data yet',
  description = 'Data will appear here once available.',
  action,
  actionLabel = 'Get Started',
  className = '',
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/10 to-lime-500/10 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-civic-green opacity-60" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-700 dark:text-gray-200 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action}
          className="btn-primary mt-5 text-sm"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}

export function ErrorState({ message = 'Failed to load data. Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-alert-red/10 flex items-center justify-center mb-3">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm">
          Retry
        </button>
      )}
    </div>
  );
}
