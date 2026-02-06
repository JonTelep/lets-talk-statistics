import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'accent' | 'border-only';
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variantClasses = {
    default: 'card-federal',
    accent: 'card-federal-accent',
    'border-only': 'bg-white border border-federal-charcoal-300',
  };

  return (
    <div
      className={`${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
