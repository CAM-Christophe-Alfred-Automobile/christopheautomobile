"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Les listes admin chargent leurs données en client-side après le montage :
// au moment où le navigateur tente de restaurer le scroll après un "retour",
// la page est encore vide/courte et la restauration native échoue.
// On sauvegarde/restaure donc la position manuellement, une fois les données prêtes.
export function useScrollRestoration(ready: boolean) {
  const pathname = usePathname();
  const restored = useRef(false);

  useEffect(() => {
    const key = `scroll:${pathname}`;
    let timeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.setItem(key, String(window.scrollY));
      }, 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [pathname]);

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;
    const saved = sessionStorage.getItem(`scroll:${pathname}`);
    if (saved) {
      setTimeout(() => window.scrollTo(0, Number(saved)), 0);
    }
  }, [ready, pathname]);
}
