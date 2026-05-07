import { motion } from 'framer-motion';

const Toggle = ({ checked = false, onChange, className = '', ...props }) => {
  return (
    <motion.button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-blue-600' : 'bg-gray-700'} ${className}`}
      onClick={() => onChange?.(!checked)}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
        animate={{ x: checked ? 24 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
};

export default Toggle;
