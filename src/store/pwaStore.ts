import { create } from 'zustand';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

interface PwaStore {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  showInstallModal: boolean;
  setDeferredPrompt: (prompt: BeforeInstallPromptEvent) => void;
  clearDeferredPrompt: () => void;
  setShowInstallModal: (show: boolean) => void;
}

export const usePwaStore = create<PwaStore>((set) => ({
  deferredPrompt: null,
  isInstallable: false,
  showInstallModal: false,
  setDeferredPrompt: (prompt) => set({ deferredPrompt: prompt, isInstallable: true }),
  clearDeferredPrompt: () => set({ deferredPrompt: null, isInstallable: false }),
  setShowInstallModal: (show) => set({ showInstallModal: show }),
}));
