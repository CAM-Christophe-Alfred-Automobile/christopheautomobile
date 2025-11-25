"use client";
import { useState, useMemo } from "react";
import servicesData from "@/app/data/services.json";
import { Header, Footer, InfoModal } from "@/components";
import Whatsapp from "@/components/whatsapp/Whatsapp";
import SelectCategorie from "@/components/categories/SelectCategorie";
import ServiceCard, {
  ColorLegend,
  getColorClasses,
} from "@/components/services/ServiceCard";
import Image from "next/image";
import SearchField from "@/components/search/SearchField";
import { siteConfig } from "@/config/site";

//! Convertir minutes → format h:mm
const formatDuree = (minutes: number | string | null) => {
  if (minutes === null) return "Sur devis";
  if (typeof minutes === "string") return minutes;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}min` : ""}`;
};

//! Limite d'une journée d'intervention (8h = 480 min)
const LIMITE_JOURNEE = 480;

//! URL Cal.com selon durée - Utilise le username depuis la config
const getCalUrl = (duree: number) => {
  const username = siteConfig.calcom.username;
  if (duree <= 60) return `https://cal.com/${username}/1h`;
  if (duree <= 90) return `https://cal.com/${username}/1h30`;
  if (duree <= 120) return `https://cal.com/${username}/2h`;
  if (duree <= 150) return `https://cal.com/${username}/2h30`;
  if (duree <= 180) return `https://cal.com/${username}/3h`;
  if (duree <= 210) return `https://cal.com/${username}/3h30`;
  if (duree <= 240) return `https://cal.com/${username}/4h`;
  if (duree <= 270) return `https://cal.com/${username}/4h30`;
  if (duree <= 300) return `https://cal.com/${username}/5h`;
  if (duree <= 330) return `https://cal.com/${username}/5h30`;
  if (duree <= 360) return `https://cal.com/${username}/6h`;
  return `https://cal.com/${username}/journee-complete`; // au-delà de 6h
};

export default function BookingPage() {
  // 🔹 HOOKS - Toujours en premier (règle React)
  const [categorie, setCategorie] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [dureeTotale, setDureeTotale] = useState<number | null>(null);
  const [dureePersonnalisee, setDureePersonnalisee] = useState<number>(60);
  const [showReservationWarning, setShowReservationWarning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "category">("search"); // Mode par défaut : recherche


  //! Catégories uniques + option "Autre"
  const categories = [
    ...Array.from(new Set(servicesData.map((s) => s.categorie))),
    "Autre / Sur mesure",
  ];

  // Fonction pour normaliser la durée (convertir en nombre pour le tri)
  const normalizeDuree = (duree: number | string | null): number => {
    if (duree === null || duree === undefined) return Infinity; // Les null à la fin
    if (typeof duree === "number") return duree;
    // Si c'est une string ("variable", "Sur devis", etc.), mettre à la fin
    return Infinity;
  };

  //! Prestations filtrées + recherche + tri par durée croissante
  const prestations = useMemo(() => {
    const filtered = servicesData.filter(
      (s) =>
        // En mode recherche : pas besoin de catégorie, en mode catégorie : filtrer par catégorie
        (searchMode === "search" || s.categorie === categorie) &&
        // Exclure UNIQUEMENT si durée est null ou non numérique
        // Le prix peut être null (ex: "À partir de X€"), seule la durée compte pour réserver
        s.duree !== null &&
        typeof s.duree === "number" &&
        // Filtrer selon la recherche
        (searchQuery === "" ||
          s.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.categorie.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Trier par durée croissante
    return filtered.sort((a, b) => {
      return normalizeDuree(a.duree) - normalizeDuree(b.duree);
    });
  }, [categorie, searchQuery, searchMode]);

  //! Sélection / déselection
  const handleSelect = (service: string) => {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
    setDureeTotale(null);
  };

  //! Supprimer une intervention sélectionnée
  const removeSelected = (service: string) => {
    setSelected((prev) => prev.filter((s) => s !== service));
    setDureeTotale(null);
  };

  //! Récupérer les détails des interventions sélectionnées
  const selectedServices = servicesData.filter((s) =>
    selected.includes(s.service)
  );

  //! Calcul durée totale
  const calculerDuree = () => {
    if (categorie === "Autre / Sur mesure") {
      setDureeTotale(dureePersonnalisee);
      return;
    }
    if (selected.length === 0) return;
    const durees = servicesData
      .filter((s) => selected.includes(s.service))
      .map((s) => (typeof s.duree === "number" ? s.duree : 0));
    const total = durees.reduce((acc, cur) => acc + cur, 0);
    setDureeTotale(total);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-[#0F0F0F] to-gray-900 text-white relative">
      {/* Logo en filigrane */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <Image
          src="/images/CAM-blanc-complet.webp"
          alt=""
          width={600}
          height={600}
          className="w-[600px] h-auto"
        />
      </div>

      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-5xl relative">
        <div className="sm:mb-12 mb-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl blur-xl"></div>
          <div className="relative bg-gray-800/30 border border-amber-500/20 rounded-2xl p-4 sm:p-8 backdrop-blur-sm">
            <div className="flex items-start justify-center gap-3 mb-3">
              <h1 className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                Réserver un créneau
              </h1>
              <div className="mt-0.5 sm:mt-1"></div>
            </div>
            <p className="text-center text-gray-300 text-base sm:text-lg mb-6">
              Sélectionnez vos interventions et trouvez votre créneau idéal
            </p>

            {/* Informations importantes */}
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {/* Acompte */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-blue-300 mb-1">
                      💳 Acompte requis
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      Un acompte vous sera demandé lors de la réservation pour
                      garantir votre créneau. Le montant varie selon la durée de
                      l’intervention, de{" "}
                      <strong className="text-amber-300">
                        15 € à 70 € maximum
                      </strong>
                      .
                    </p>

                    <p className="text-xs sm:text-sm text-blue-300 mt-1 font-medium">
                      ✓ Déduit du prix final
                    </p>
                  </div>
                </div>
              </div>

              {/* Achat de pièces */}
              <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-amber-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-amber-300 mb-1 tex">
                      🔧 Achat de pièces
                    </h4>

                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                      Si le mécanicien doit s&#39;occuper de commander les
                      pièces, merci de{" "}
                      <strong className="text-amber-300">
                        le contacter avant de réserver
                      </strong>{" "}
                      afin de confirmer les références et le coût des pièces.
                      <br />
                      Un acompte de{" "}
                      <strong className="text-amber-300">40 %</strong> du total
                      des pièces sera demandé avant l’achat.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Choix du mode : Recherche OU Catégorie */}
        <div className={`relative z-0 mb-8 w-full max-w-3xl mx-auto pt-4 sm:pt-0 px-4 sm:px-0 ${
          searchMode === "category" && !categorie ? "min-h-[600px]" : ""
        }`}>
          <label className="relative z-0 block mb-6 font-semibold text-lg sm:text-xl text-amber-400 text-center">
            1. Comment souhaitez-vous trouver votre intervention ?
          </label>

          {/* Toggle entre recherche et catégorie */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => {
                setSearchMode("search");
                setCategorie("");
              }}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                searchMode === "search"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sm:scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="whitespace-nowrap">Rechercher directement</span>
            </button>
            <button
              onClick={() => {
                setSearchMode("category");
                setSearchQuery("");
              }}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                searchMode === "category"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sm:scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span className="whitespace-nowrap">Parcourir par catégorie</span>
            </button>
          </div>

          {/* Mode recherche */}
          {searchMode === "search" && (
            <div className="px-6 sm:px-0">
              <p className="text-center text-gray-400 mb-4 text-sm">
                💡 Tapez directement ce que vous cherchez (ex: "vidange", "plaquettes", "diagnostic")
              </p>
              <SearchField
                value={searchQuery}
                onChange={setSearchQuery}
                resultCount={prestations.length}
                showResultCount={true}
              />
            </div>
          )}

          {/* Mode catégorie */}
          {searchMode === "category" && (
            <div className="px-6 sm:px-0">
              <p className="text-center text-gray-400 mb-4 text-sm">
                💡 Sélectionnez d'abord une catégorie, puis choisissez vos interventions
              </p>
              <SelectCategorie
                categorie={categorie}
                setCategorie={(value) => {
                  setCategorie(value);
                  setDureeTotale(null);
                }}
                categories={categories}
              />
            </div>
          )}
        </div>

        {/* Durée personnalisée pour "Autre / Sur mesure" */}
        {categorie === "Autre / Sur mesure" && (
          <div className="mb-8 max-w-2xl mx-auto">
            <label className="block mb-3 font-semibold text-lg text-amber-400">
              2. Choisissez la durée de l&#39;intervention
            </label>
            <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6">
              <p className="text-gray-300 mb-4">
                💡 <strong>Deux cas possibles :</strong>
              </p>
              <ul className="text-gray-300 mb-4 space-y-2 list-disc list-inside">
                <li>Vous avez convenu d&apos;une durée avec le mécanicien</li>
                <li>
                  Votre besoin ne correspond pas aux interventions listées
                </li>
              </ul>
              <p className="text-amber-400 mb-4 text-sm">
                👉 Ajustez la durée estimée avec le curseur :
              </p>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="60"
                    max="480"
                    step="30"
                    value={dureePersonnalisee}
                    onChange={(e) =>
                      setDureePersonnalisee(Number(e.target.value))
                    }
                    className="flex-1 h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    style={{
                      background: `linear-gradient(to right, rgb(245, 158, 11) 0%, rgb(245, 158, 11) ${
                        ((dureePersonnalisee - 60) / (480 - 60)) * 100
                      }%, rgb(55, 65, 81) ${
                        ((dureePersonnalisee - 60) / (480 - 60)) * 100
                      }%, rgb(55, 65, 81) 100%)`,
                    }}
                  />
                  <span className="text-3xl font-bold text-amber-400 min-w-[120px] text-right">
                    {dureePersonnalisee > 360
                      ? "Journée entière"
                      : formatDuree(dureePersonnalisee)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prestations - Afficher si : (mode recherche + recherche active) OU (mode catégorie + catégorie sélectionnée) */}
        {((searchMode === "search" && searchQuery) || 
          (searchMode === "category" && categorie && categorie !== "Autre / Sur mesure")) && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="font-semibold text-lg text-amber-400">
                2. Sélectionnez vos interventions
              </label>

              {/* Légende des couleurs */}
              <ColorLegend />
            </div>

            {prestations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
                <p className="text-gray-400 text-lg mb-4">
                  Aucune intervention trouvée{searchQuery && ` pour "${searchQuery}"`}
                </p>
                {searchMode === "search" && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
                  >
                    Réinitialiser la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {prestations.map((p) => (
                  <ServiceCard
                    key={p.service}
                    service={p.service}
                    duree={p.duree}
                    description={p.description}
                    isSelected={selected.includes(p.service)}
                    onSelect={() => handleSelect(p.service)}
                    showCheckbox={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Interventions sélectionnées */}
        {selected.length > 0 && (
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-amber-500/10 to bg-gray-800/30 border border-amber-500/20 rounded-xl p-4 sm:p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-lg md:text-2xl font-bold text-amber-400 flex items-center justify-center gap-2">
                  <InfoModal />
                  Récapitulatif de votre sélection
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className="
                    text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-lg whitespace-nowrap
                    bg-gradient-to-br from-amber-500/20 via-amber-600/20 to-amber-700/20
                    text-amber-300 border border-amber-500/40 shadow-md
                  "
                  >
                    {selected.length} intervention
                    {selected.length > 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => {
                      setSelected([]);
                      setDureeTotale(null);
                    }}
                    className="
    relative cursor-pointer px-4 py-2 rounded-lg
    bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800
    text-gray-200 font-medium tracking-wide
    border border-gray-700/60 shadow-md
    hover:text-white hover:border-red-500/60
    hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
    transition-all duration-300 ease-out
    hover:scale-105 active:scale-95
  "
                    aria-label="Vider la sélection"
                    title="Vider toute la sélection"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service.service} className="relative">
                    <div className="flex items-center gap-3 bg-gray-800/50 border border-gray-600 rounded-xl p-3 pr-12">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white text-sm leading-tight">
                          {service.service}
                        </div>
                        {service.description && (
                          <p className="text-xs text-gray-400 leading-relaxed mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium whitespace-nowrap px-3 py-0.5 rounded border ${
                          getColorClasses(service.duree).badge
                        }`}
                      >
                        ⏱ {formatDuree(service.duree)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeSelected(service.service)}
                      className="
                        absolute top-1/2 -translate-y-1/2 right-2
                        cursor-pointer p-2 rounded-lg
                        bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800
                        text-gray-200 font-medium
                        border border-gray-700/60 shadow-md
                        hover:text-white hover:border-red-500/60
                        hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]
                        transition-all duration-300 ease-out
                        hover:scale-105 active:scale-95
                      "
                      aria-label="Retirer"
                      title="Retirer cette intervention"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bouton Calcul */}
        {(selected.length > 0 || categorie === "Autre / Sur mesure") && (
          <div className="text-center mb-10">
            <button
              onClick={() => {
                calculerDuree();
                setShowReservationWarning(true); // 👉 affiche l’encart après calcul
              }}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all px-3 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              {categorie === "Autre / Sur mesure"
                ? `✓ Réserver ${formatDuree(dureePersonnalisee)}`
                : `✓ Calculer la durée totale (${selected.length} intervention${
                    selected.length > 1 ? "s" : ""
                  })`}
            </button>
          </div>
        )}

        {/* Résultat */}
        {dureeTotale && (
          <div className="space-y-8">
            <p className="text-center text-lg">
              ⏱{" "}
              {categorie === "Autre / Sur mesure"
                ? "Durée sélectionnée"
                : "Durée totale estimée"}{" "}
              :{" "}
              <span className="font-semibold text-amber-400">
                {formatDuree(dureeTotale)}
              </span>
            </p>
            {categorie === "Autre / Sur mesure" && (
              <p className="text-center text-sm text-gray-400 -mt-4">
                💬 Intervention personnalisée ou besoin spécifique
              </p>
            )}
            {/* ⚠️ Avertissement avant réservation */}
            {showReservationWarning && dureeTotale <= LIMITE_JOURNEE && (
              <div
                className="mt-8 max-w-2xl mx-auto text-center text-sm text-gray-200 bg-gray-800/40 border border-gray-700/60 rounded-xl px-6 py-4 leading-relaxed shadow-[0_0_15px_rgba(0,0,0,0.4)] backdrop-blur-sm opacity-0 translate-y-2 transition-all duration-500 ease-out [animation:fadeIn_0.4s_ease-out_forwards]"
                style={{
                  animation: "fadeIn 0.4s ease-out forwards",
                }}
              >
                <span className="block mb-1 text-amber-400 font-semibold tracking-wide">
                  ⚙️ Information importante
                </span>
                <p className="text-gray-300">
                  Avant de réserver, assurez-vous que les pièces nécessaires à
                  l’intervention seront disponibles le jour du rendez-vous.
                </p>
              </div>
            )}

            {/* Si la durée dépasse une journée */}
            {dureeTotale > LIMITE_JOURNEE ? (
              <div className="text-center bg-red-900/20 border border-red-700 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-red-400 mb-2">
                  ⚠️ Intervention trop longue pour une réservation en ligne
                </h3>
                <p className="text-gray-300 mb-4">
                  Cette intervention nécessite plus d&apos;une journée de
                  travail ({formatDuree(dureeTotale)} estimées).
                  <br />
                  Pour planifier ce type d&apos;intervention, merci de me
                  contacter directement.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 transition px-6 py-3 rounded-lg font-semibold text-white shadow-md"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Via la page Contact</span>
                  </a>
                  <Whatsapp
                    message="Bonjour Christophe, je souhaite planifier une intervention longue (plus d'une journée)."
                    label="Sur WhatsApp"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-start">
                <iframe
                  src={getCalUrl(dureeTotale)!}
                  className="w-[90%] md:w-full h-[900px] rounded-xl border-none"
                />
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
