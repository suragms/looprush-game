import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, icon, highlight }: StatCardProps) {
  return (
    <div className="flex flex-col items-center px-3 py-2">
      {icon && <span className="text-2xl mb-1">{icon}</span>}
      <span
        className={`font-display text-xl font-bold ${
          highlight ? 'text-neon-yellow' : 'text-white'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
      <span className="text-xs text-gray-400 font-body uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
