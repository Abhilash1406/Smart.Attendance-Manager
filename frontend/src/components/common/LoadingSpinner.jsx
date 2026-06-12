import React from 'react';
import { clsx } from 'clsx';

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
  xl: 'h-16 w-16 border-4',
};

const LoadingSpinner = ({ size = 'md', className = '', color = 'primary' }) => {
  const colorClass = color === 'white'
    ? 'border-white/30 border-t-white'
    : 'border-primary-200 border-t-primary-600';

  return (
    <div
      className={clsx(
        'animate-spin rounded-full',
        sizes[size],
        colorClass,
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
