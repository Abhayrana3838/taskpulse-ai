import { motion } from 'framer-motion';

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border border-gray-700',
    primary: 'bg-blue-600/20 text-blue-400 border border-blue-500/50',
    success: 'bg-green-600/20 text-green-400 border border-green-500/50',
    warning: 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/50',
    danger: 'bg-red-600/20 text-red-400 border border-red-500/50',
    purple: 'bg-purple-600/20 text-purple-400 border border-purple-500/50',
  };
  
  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
