import React from 'react';
import { useTheme } from '../utils/ThemeContext';

const Card = ({
  children,
  variant = 'default',
  className = '',
  animate = false,
  hover = false,
  glass = false,
  ...props
}) => {
  const { darkMode } = useTheme();

  const baseClasses = 'card';
  const animationClasses = animate ? 'animate-fade-in' : '';
  const hoverClasses = hover ? 'card-hover' : '';
  const glassClasses = glass ? 'card-glass' : '';

  const variantClasses = {
    default: '',
    primary: 'border-l-4 border-primary-500',
    secondary: 'border border-gray-200 dark:border-gray-700',
    error: 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10',
    success: 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/10',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
  };

  return (
    <div
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${animationClasses}
        ${hoverClasses}
        ${glassClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-b dark:border-gray-700 border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 border-t dark:border-gray-700 border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;