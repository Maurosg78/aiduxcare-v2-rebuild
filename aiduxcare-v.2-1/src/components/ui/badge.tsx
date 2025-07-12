import React from 'react';

interface BadgeProps {
  variant?: 'default' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children }) => {
  const baseStyles = 'inline-flex items-center px-2 py-1 rounded text-sm font-medium';
  const variantStyles = {
    default: 'bg-gray-200 text-gray-800',
    destructive: 'bg-red-200 text-red-800',
    outline: 'border border-gray-300 text-gray-800',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;