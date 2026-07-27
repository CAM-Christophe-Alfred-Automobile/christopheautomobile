/**
 * ============================================================================
 * 📄 COMPOSANT : AudienceGate
 * ============================================================================
 * Écran d'accueil affiché au premier passage sur la page d'accueil : demande
 * si le visiteur est un particulier ou un professionnel, puis oriente vers
 * la page correspondante. Le choix est mémorisé (localStorage) pour ne plus
 * être redemandé aux visites suivantes.
 * ============================================================================
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AUDIENCE_CHOICE_KEY } from "@/lib/audienceChoice";

export default function AudienceGate() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = window.localStorage.getItem(AUDIENCE_CHOICE_KEY);
    if (!choice) setVisible(true);
  }, []);

  const choose = (audience: "particulier" | "professionnel") => {
    window.localStorage.setItem(AUDIENCE_CHOICE_KEY, audience);
    setVisible(false);
    if (audience === "professionnel") router.push("/professionnels");
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-md text-center">
        <Image
          src="/images/CAM-blanc-complet.webp"
          alt="Logo CAM"
          width={140}
          height={140}
          priority
          className="mx-auto mb-6 h-auto w-[110px]"
          style={{ width: "auto", height: "auto" }}
        />
        <p className="text-xl sm:text-2xl font-bold text-white mb-8">
          Vous êtes un particulier ou un professionnel ?
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => choose("particulier")}
            className="cursor-pointer flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all text-white font-bold py-4 px-6 rounded-xl shadow-lg"
          >
            Je suis un particulier
          </button>
          <button
            onClick={() => choose("professionnel")}
            className="cursor-pointer flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-all text-white font-bold py-4 px-6 rounded-xl shadow-lg"
          >
            Je suis un professionnel
          </button>
        </div>
      </div>
    </div>
  );
}
