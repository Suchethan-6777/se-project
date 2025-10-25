import React from 'react';
import { useTheme } from '../utils/ThemeContext';
import Loading from './Loading';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  ...props
}) => {
  const { darkMode } = useTheme();

  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: darkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
    danger: darkMode ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant] || ''}
        ${fullWidth ? 'w-full' : ''}
        ${loading ? 'opacity-75 cursor-not-allowed' : ''}
        ${props.className || ''}
      `}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <Loading size="sm" />
          <span className="ml-2">{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;