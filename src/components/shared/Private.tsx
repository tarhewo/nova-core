import { ReactNode, useEffect, useRef, useState } from "react";
import { usePrivacy } from "@/store/privacy";

interface PrivateProps {
  children: ReactNode;
  /**
   * - "auto"  → respects global mode (blur in smart, mask in mask, etc.)
   * - "blur"  → always blurs (good for balances/cards/lists)
   * - "mask"  → always masks with bullets (good for tokens/IDs)
   */
  variant?: "auto" | "blur" | "mask";
  /** Bullet length used in mask mode. Defaults to 6. */
  maskLength?: number;
  className?: string;
}

/**
 * Adaptive Obsidian Privacy wrapper.
 * Tap / hover to reveal for 3 seconds. Cooperates with global Stealth Mode.
 */
export function Private({ children, variant = "auto", maskLength = 6, className }: PrivateProps) {
  const { mode, stealth } = usePrivacy();
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  // No obfuscation needed when off + not stealth
  const inactive = mode === "off" && !stealth;
  const reveal = () => {
    if (stealth) return; // Stealth Mode disables reveal
    setRevealed(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setRevealed(false), 3000);
  };

  if (inactive) return <span className={className}>{children}</span>;

  const dots = "•".repeat(maskLength);
  return (
    <span
      data-private={variant}
      data-revealed={revealed ? "true" : "false"}
      data-mask={dots}
      className={className}
      onClick={reveal}
      onMouseEnter={reveal}
      role="button"
      aria-label="Tap to reveal sensitive value"
    >
      <span className="private-value">{children}</span>
    </span>
  );
}