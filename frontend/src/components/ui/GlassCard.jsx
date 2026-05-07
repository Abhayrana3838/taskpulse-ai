import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      className={`glass-card ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 20px 40px rgba(0, 112, 243, 0.15)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
