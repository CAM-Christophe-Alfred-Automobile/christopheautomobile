"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title?: string;
  allowCloseIcon?: boolean;
};

export default function Min60Modal({
  title = "Information – intervention à domicile",
  allowCloseIcon = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const okBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const close = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";
    setTimeout(() => okBtnRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl">
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/25 via-cyan-400/15 to-indigo-500/25 blur-xl" />

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/90 shadow-2xl">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-indigo-500" />

          <div className="p-6 sm:p-7">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/25">
                <svg
                  className="h-6 w-6 text-sky-300"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 10v7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 7h.01"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    {title}
                  </h2>
                  <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200">
                    À lire avant de réserver
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  Transparence sur la tarification des petites interventions.
                </p>
              </div>

              {allowCloseIcon && (
                <button
                  onClick={close}
                  className="rounded-xl p-2 text-slate-300 hover:bg-white/5 hover:text-white transition"
                  aria-label="Fermer"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-200">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p>
                  Certaines petites prestations sont affichées à{" "}
                  <span className="inline-flex items-center rounded-lg bg-sky-500/15 px-2 py-0.5 font-semibold text-sky-200 border border-sky-500/20">
                    60€
                  </span>{" "}
                  : c’est le <strong>minimum d’intervention</strong> pour un
                  déplacement à domicile.
                </p>
              </div>

               <ul className="space-y-2">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-sky-400/80" />
                  <span>
                    Si plusieurs petites interventions sont réalisées lors du même
                    déplacement, <strong>le tarif pourra être adapté</strong>.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300/80" />
                  <span>
                    Pour une estimation plus précise,{" "}
                    <strong>n’hésitez pas à prendre contact avant de réserver</strong>.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-6 flex items-center justify-end">
              <button
                ref={okBtnRef}
                onClick={close}
                className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 hover:brightness-110 active:brightness-95 transition focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
              >
                OK j'ai compris
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}