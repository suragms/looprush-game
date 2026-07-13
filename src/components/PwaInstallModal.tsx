import React, { useMemo } from 'react';
import { usePwaStore } from '@/store/pwaStore';

export function PwaInstallModal() {
  const showInstallModal = usePwaStore((s) => s.showInstallModal);
  const setShowInstallModal = usePwaStore((s) => s.setShowInstallModal);

  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasMSStream = 'MSStream' in window && !!(window as Record<string, unknown>).MSStream;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !hasMSStream;
  }, []);

  if (!showInstallModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/75 backdrop-blur-sm animate-float-in">
      <div className="w-full max-w-sm bg-bg-panel/95 border-2 border-neon-cyan shadow-neon rounded-2xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={() => setShowInstallModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white font-display text-lg select-none"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h3 className="font-display text-xl font-bold text-neon-cyan mb-4 flex items-center gap-2">
          📥 Install Loop Rush
        </h3>

        <p className="text-gray-300 font-body text-sm mb-6 leading-relaxed">
          Install Loop Rush on your device for full-screen arcade action, offline play, and faster load times.
        </p>

        {isIOS ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 flex items-center justify-center font-display text-xs font-bold">
                1
              </span>
              <p className="text-white font-body text-sm">
                Tap the Share button <span className="text-neon-magenta font-bold">📤</span> in the Safari browser toolbar.
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 flex items-center justify-center font-display text-xs font-bold">
                2
              </span>
              <p className="text-white font-body text-sm">
                Scroll down and tap <span className="text-neon-cyan font-bold">Add to Home Screen ➕</span>.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 flex items-center justify-center font-display text-xs font-bold">
                1
              </span>
              <p className="text-white font-body text-sm">
                Tap the browser menu button (usually <span className="font-bold text-neon-cyan">three dots ⋮</span> in the top/bottom right).
              </p>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/40 flex items-center justify-center font-display text-xs font-bold">
                2
              </span>
              <p className="text-white font-body text-sm">
                Select <span className="text-neon-cyan font-bold">Install app</span> or <span className="text-neon-cyan font-bold">Add to Home Screen</span>.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => setShowInstallModal(false)}
          className="mt-8 w-full py-3 rounded-lg font-display text-sm font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan/30 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
