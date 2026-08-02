"use client";

import { useCallback, useRef, useState } from "react";

interface LongPressButtonProps {
  onLongPress: () => void;
  duration?: number; // ms à tenir avant déclenchement
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Bouton à appui long : évite qu'un tap accidentel (téléphone dans la poche, doigt qui glisse)
 * déclenche une action à effet réel (démarrer une intervention, etc.). Pendant l'appui, le
 * libellé passe en gras et un anneau de progression se remplit autour du bouton, pour qu'on
 * voie clairement que l'appui est pris en compte et combien de temps il reste à tenir — sans
 * ce retour visuel, on ne sait jamais si on a vraiment le doigt dessus. Un relâchement avant la
 * fin annule sans rien déclencher.
 */
export default function LongPressButton({
  onLongPress,
  duration = 600,
  disabled = false,
  className = "",
  children,
}: LongPressButtonProps) {
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  const clear = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    timeoutRef.current = null;
    rafRef.current = null;
    setPressing(false);
    setProgress(0);
  }, []);

  const tick = useCallback(() => {
    const elapsed = Date.now() - startRef.current;
    setProgress(Math.min(1, elapsed / duration));
    if (elapsed < duration) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [duration]);

  const start = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      setPressing(true);
      startRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
      timeoutRef.current = setTimeout(() => {
        clear();
        onLongPress();
      }, duration);
    },
    [disabled, duration, onLongPress, tick, clear]
  );

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={start}
      onPointerUp={clear}
      onPointerLeave={clear}
      onPointerCancel={clear}
      onContextMenu={(e) => e.preventDefault()}
      style={
        pressing
          ? {
              background: `linear-gradient(to right, rgba(255,255,255,0.25) ${progress * 100}%, transparent ${progress * 100}%)`,
            }
          : undefined
      }
      className={`select-none touch-none transition-[font-weight,color] ${pressing ? "font-bold" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
