import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Adaptive Obsidian Privacy — global controller.
 * - `mode` decides how `data-private="auto"` elements obfuscate.
 * - `stealth` overrides everything and blurs all tagged values.
 */
export type PrivacyMode = "off" | "blur" | "mask" | "smart";

interface PrivacyState {
  mode: PrivacyMode;
  stealth: boolean;
  setMode: (m: PrivacyMode) => void;
  toggleStealth: () => void;
}

export const usePrivacy = create<PrivacyState>()(
  persist(
    (set) => ({
      mode: "smart",
      stealth: false,
      setMode: (mode) => set({ mode }),
      toggleStealth: () => set((s) => ({ stealth: !s.stealth })),
    }),
    { name: "nexus.privacy" },
  ),
);

/** Maps the store state to a single root-level CSS attribute consumed by index.css. */
export function applyPrivacyAttribute(mode: PrivacyMode, stealth: boolean) {
  const root = document.documentElement;
  if (stealth) root.setAttribute("data-privacy-mode", "stealth");
  else if (mode === "off") root.setAttribute("data-privacy-mode", "off");
  else if (mode === "mask") root.setAttribute("data-privacy-mode", "mask");
  else if (mode === "blur") root.setAttribute("data-privacy-mode", "blur");
  else root.setAttribute("data-privacy-mode", "smart");
}