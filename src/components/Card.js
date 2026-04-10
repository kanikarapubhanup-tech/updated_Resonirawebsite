import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card component with hover effects and glassmorphism
 * @param {Object} props - Component props
 * @param {string} props.variant - Card variant: 'default', 'glass', 'elevated'
 * @param {boolean} props.hover - Whether to show hover effects
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
const Card = ({ 
  variant = 'default', 
  hover = true, 
  className = '', 
  children,
  ...props 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-300';
  
  const variants = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    glass: 'glass dark:glass-dark shadow-lg',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700'
  };
  
  const hoverClasses = hover ? 'card-hover' : '';
  
  const cardClasses = `${baseClasses} ${variants[variant]} ${hoverClasses} ${className}`;
  
  return (
    <motion.div
      className={cardClasses}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/**
 * Card Header component
 */
export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`p-6 pb-0 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Content component
 */
export const CardContent = ({ className = '', children, ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * Card Footer component
 */
export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
