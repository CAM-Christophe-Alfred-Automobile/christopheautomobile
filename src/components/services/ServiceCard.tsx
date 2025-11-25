/**
 * ============================================================================
 * 📄 COMPOSANT : ServiceCard
 * ============================================================================
 * Carte d'affichage d'une intervention/service avec code couleur par durée
 *
 * 🎯 OBJECTIF :
 * - Afficher une intervention avec son nom, durée, description et prix
 * - Code couleur automatique selon la durée (vert/orange/rouge)
 * - Composant réutilisable pour éviter la duplication de code
 *
 * 📍 UTILISÉ DANS :
 * - /src/app/booking/page.tsx (avec checkbox pour sélection)
 * - /src/app/tarifs/page.tsx (sans checkbox, affichage simple)
 *
 * 🔧 PROPS :
 * - service: Nom de l'intervention
 * - duree: Durée en minutes
 * - description: Description optionnelle
 * - prix: Prix optionnel (affiché uniquement sur page tarifs)
 * - isSelected: Si la carte est sélectionnée (pour page booking)
 * - onSelect: Fonction appelée lors du clic (pour page booking)
 * - showCheckbox: Afficher ou non la checkbox (true pour booking, false pour tarifs)
 *
 * 🎨 CODE COULEUR :
 * - VERT : Interventions rapides (≤ 2h30)
 * - ORANGE : Interventions moyennes (2h30 - 3h30)
 * - ROUGE : Interventions longues (> 3h30)
 * - GRIS : Sur devis / Variable (durée ou prix non défini)
 *
 * 💡 AVANTAGES :
 * - Un seul composant pour deux pages différentes
 * - Code couleur cohérent partout
 * - Layout optimisé et compact
 * ============================================================================
 */

"use client";

//! Code couleur selon la durée (vert/orange/rouge/gris)
export const getColorClasses = (duree: number | string | null) => {
  // Si durée est null, "Sur devis", "Variable" ou "Durée variable" → GRIS
  const isOnQuote = 
    duree === null || 
    duree === "Sur devis" || 
    duree === "Variable" || 
    duree === "Durée variable";

  if (isOnQuote) {
    // Sur devis / Variable : GRIS
    return {
      border: "border-gray-500",
      bg: "bg-gray-500/10",
      shadow: "shadow-gray-500/20",
      hover: "hover:border-gray-400",
      badge: "bg-gray-600/20 border-gray-600/50 text-gray-400",
    };
  }

  const minutes = typeof duree === "number" ? duree : 0;

  if (minutes <= 150) {
    // <= 2h30 : VERT
    return {
      border: "border-green-500",
      bg: "bg-green-500/20",
      shadow: "shadow-green-500/20",
      hover: "hover:border-green-400",
      badge: "bg-green-600/20 border-green-600/50 text-green-400",
    };
  } else if (minutes <= 210) {
    // 2h30 à 3h30 : ORANGE
    return {
      border: "border-orange-500",
      bg: "bg-orange-500/20",
      shadow: "shadow-orange-500/20",
      hover: "hover:border-orange-400",
      badge: "bg-orange-600/20 border-orange-600/50 text-orange-400",
    };
  } else {
    // > 3h30 : ROUGE
    return {
      border: "border-red-500",
      bg: "bg-red-500/20",
      shadow: "shadow-red-500/20",
      hover: "hover:border-red-400",
      badge: "bg-red-600/20 border-red-600/50 text-red-400",
    };
  }
};

//! Convertir minutes → format h:mm
const formatDuree = (minutes: number | string | null) => {
  if (minutes === null) return "Sur devis";
  if (typeof minutes === "string") return minutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}min` : ""}`;
};

interface ServiceCardProps {
  service: string;
  duree: number | string | null;
  description?: string;
  prix?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  showCheckbox?: boolean;
}

export default function ServiceCard({
  service,
  duree,
  description,
  prix,
  isSelected = false,
  onSelect,
  showCheckbox = false,
}: ServiceCardProps) {
  const colors = getColorClasses(duree);

  const CardWrapper = showCheckbox ? "label" : "div";

  return (
    <CardWrapper
      className={`flex items-start gap-3 bg-gray-800/50 border-2 rounded-xl p-3 transition-all ${
        showCheckbox ? "cursor-pointer hover:scale-[1.02]" : ""
      } ${
        isSelected
          ? `${colors.border} ${colors.bg} shadow-lg ${colors.shadow}`
          : `border-gray-700 ${showCheckbox ? colors.hover : ""}`
      }`}
    >
      {showCheckbox && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="hidden"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm sm:text-base leading-tight">
          {service}
        </div>
        {description && (
          <p className="text-xs text-gray-400 leading-relaxed mt-1">
            {description}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {prix && (
          <span className="text-amber-400 font-bold text-lg whitespace-nowrap">
            {prix}
          </span>
        )}
        <span
          className={`text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded border ${colors.badge}`}
        >
          ⏱ {formatDuree(duree)}
        </span>
      </div>
    </CardWrapper>
  );
}

// Export aussi la légende pour la réutiliser
export function ColorLegend() {
  return (
    <div className="flex flex-wrap gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/20"></div>
        <span className="text-gray-400">≤ 2h30</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border-2 border-orange-500 bg-orange-500/20"></div>
        <span className="text-gray-400">2h30 - 3h30</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/20"></div>
        <span className="text-gray-400">&gt; 3h30</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded border-2 border-gray-500 bg-gray-500/10"></div>
        <span className="text-gray-400">Sur devis</span>
      </div>
    </div>
  );
}
