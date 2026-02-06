import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'btn-federal font-sans font-semibold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-federal-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const variantClasses = {
    primary: 'btn-federal-primary',
    accent: 'btn-federal-accent',
    outline: 'btn-federal-outline',
    gold: 'bg-federal-gold-600 border-federal-gold-600 text-federal-navy-900 hover:bg-federal-gold-700 hover:border-federal-gold-700',
    danger: 'bg-federal-red-600 border-federal-red-600 text-white hover:bg-federal-red-700 hover:border-federal-red-700',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
