import { motion } from 'framer-motion';

const ProgressBar = ({ value = 0, max = 100, className = '', color = 'blue', ...props }) => {
  const colors = {
    blue: 'from-blue-600 to-blue-400',
    purple: 'from-purple-600 to-purple-400',
    green: 'from-green-600 to-green-400',
    yellow: 'from-yellow-600 to-yellow-400',
    red: 'from-red-600 to-red-400',
  };
  
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  return (
    <div className={`w-full bg-gray-800 rounded-full h-2 overflow-hidden ${className}`} {...props}>
      <motion.div
        className={`h-full bg-gradient-to-r ${colors[color]}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
};

export default ProgressBar;
