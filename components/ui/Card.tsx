// Surface card with consistent dark background and rounded corners
import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-surface rounded-2xl p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
