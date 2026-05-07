import { motion } from 'framer-motion';

const Avatar = ({ src, alt = 'Avatar', size = 'md', className = '', ...props }) => {
  const sizes = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };
  
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </motion.div>
  );
};

export default Avatar;
