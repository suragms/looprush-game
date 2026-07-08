import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="flex items-center justify-between px-4 py-2 cursor-pointer select-none">
      <span className="text-white font-body text-base">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-neon-cyan' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  );
}
