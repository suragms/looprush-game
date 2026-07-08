import React from 'react';

interface NeonButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
  disabled?: boolean;
}

export function NeonButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled = false,
}: NeonButtonProps) {
  const base =
    'relative px-8 py-3 rounded-lg font-display text-lg font-bold transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:active:scale-100';

  const variants: Record<string, string> = {
    primary:
      'bg-neon-cyan/20 text-neon-cyan border-2 border-neon-cyan shadow-neon hover:bg-neon-cyan/30',
    secondary:
      'bg-bg-panel text-white border-2 border-neon-purple hover:bg-neon-purple/20 shadow-neon-magenta',
    danger:
      'bg-red-500/20 text-neon-red border-2 border-neon-red hover:bg-red-500/30',
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.primary} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
