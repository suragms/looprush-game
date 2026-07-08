import React from 'react';
import { useGameStore } from '@/store/gameStore';

export function ToastContainer() {
  const toasts = useGameStore((s) => s.toasts);
  const removeToast = useGameStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 max-w-xs w-full px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-float-in px-4 py-3 rounded-lg border backdrop-blur-sm flex items-center justify-between cursor-pointer ${
            t.kind === 'achievement'
              ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300'
              : t.kind === 'event'
              ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
              : 'bg-bg-panel border-gray-600 text-white'
          }`}
          onClick={() => removeToast(t.id)}
        >
          <div>
            <p className="font-display text-sm font-bold">{t.title}</p>
            {t.body && <p className="text-xs opacity-80 mt-0.5">{t.body}</p>}
          </div>
          <button className="ml-2 text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      ))}
    </div>
  );
}
