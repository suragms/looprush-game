import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-4 py-2 cursor-pointer select-none text-left focus:outline-none hover:bg-white/5 active:bg-white/10 transition-colors duration-100"
    >
      <span className="text-white font-body text-base">{label}</span>
      <div
        className={`relative w-12 h-6 rounded-full transition-colors duration-100 ${
          checked ? 'bg-neon-cyan' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-100 ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
}
