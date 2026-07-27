"use client";
import { useState, useMemo } from "react";
import servicesData from "@/app/data/services.json";
import { Header, Footer, InfoModal } from "@/components";
import Whatsapp from "@/components/whatsapp/Whatsapp";
import SelectCategorie from "@/components/categories/SelectCategorie";
import ServiceCard, {
  getColorClasses,
} from "@/components/services/ServiceCard";
import Image from "next/image";
import SearchField from "@/components/search/SearchField";
import { siteConfig } from "@/config/site";
import { symptoms, type SymptomKey } from "@/app/data/symptomGuide";
import ZoneBooking from "@/components/booking/ZoneBooking";
import { partsGuidance, defaultPartsGuidance, partsGuidanceByService } from "@/app/data/partsGuidance";
import { marques, modelesParMarque } from "@/app/data/vehicleOptions";
import { VEHICLE_TIERS, type VehicleTier } from "@/app/data/vehicleTiers";

const AUTRE_MODELE = "__autre__";
const SEUIL_ANNEE_MOTORISATIONS_RECENTES = 2016;


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

export default function BookingPage() {
  // 🔹 HOOKS - Toujours en premier (règle React)
  const [categorie, setCategorie] = useState("");
  const [guideServicesFilter, setGuideServicesFilter] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [dureeTotale, setDureeTotale] = useState<number | null>(null);
  const [prixTotal, setPrixTotal] = useState<number | string | null>(null);
  const [dureePersonnalisee, setDureePersonnalisee] = useState<number>(60);
  const [showReservationWarning, setShowReservationWarning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"search" | "category" | "guide">("search"); // Mode par défaut : recherche
  const [isCatOpen, setIsCatOpen] = useState(false);
  // État du questionnaire guidé ("Je ne sais pas ce qu'il me faut")
  const [guideSymptomKey, setGuideSymptomKey] = useState<SymptomKey | null>(null);
  const [guideSubKey, setGuideSubKey] = useState<string | null>(null);
  const [guideSubKey2, setGuideSubKey2] = useState<string | null>(null);
  const [vehicleMarque, setVehicleMarque] = useState("");
  const [vehicleModele, setVehicleModele] = useState("");
  const [vehicleModeleLibre, setVehicleModeleLibre] = useState(""); // saisie manuelle si "Autre / je ne trouve pas"
  const [vehicleMotorisation, setVehicleMotorisation] = useState("");
  const [vehicleMotorisationLibre, setVehicleMotorisationLibre] = useState("");
  const [vehicleAnnee, setVehicleAnnee] = useState("");

  const modelesDisponibles = useMemo(
    () => modelesParMarque[vehicleMarque] ?? [],
    [vehicleMarque]
  );
  // Les motorisations listées correspondent aux générations récentes (~2016+ : PureTech, BlueHDi, TCe, TSI EVO...).
  // Pour un véhicule plus ancien, on ne propose pas de motorisation au hasard : bascule en saisie libre.
  const anneeAncienne = (() => {
    const annee = parseInt(vehicleAnnee, 10);
    return !isNaN(annee) && annee < SEUIL_ANNEE_MOTORISATIONS_RECENTES;
  })();
  const motorisationsDisponibles = useMemo(
    () => (anneeAncienne ? [] : modelesDisponibles.find((m) => m.modele === vehicleModele)?.motorisations ?? []),
    [modelesDisponibles, vehicleModele, anneeAncienne]
  );
  // État pour gérer le contact préalable pour les interventions sur devis
  const [hasContactedMechanic, setHasContactedMechanic] = useState<boolean | null>(null);
  const [vehicleTier, setVehicleTier] = useState<VehicleTier>("standard");

  //! Catégories uniques + tri avec cas spéciaux à la fin
  const categoriesList = [
    ...Array.from(new Set(servicesData.map((s) => s.categorie))),
    "Intervention sur devis",
  ];

  // Tri spécial : ordre alphabétique sauf "Autre interventions" et "Intervention sur devis" à la fin
  const categories = categoriesList.sort((a, b) => {
    // Cas spéciaux à mettre à la fin
    if (a === "Intervention sur devis") return 1; // Toujours en dernier
    if (b === "Intervention sur devis") return -1;
    if (a === "Autre interventions") return 1; // Avant-dernier
    if (b === "Autre interventions") return -1;
    // Sinon ordre alphabétique
    return a.localeCompare(b);
  });

  //! Questionnaire guidé : symptôme sélectionné + réponse résolue (catégorie + explication)
  // Un SubAnswer peut soit être terminal (categorie/explication/services, ou nonPropose),
  // soit avoir sa propre sous-question (un seul niveau de plus, ex: panne -> essence).
  const selectedSymptom = symptoms.find((s) => s.key === guideSymptomKey) ?? null;
  const level1Answer = selectedSymptom?.subAnswers?.find((a) => a.key === guideSubKey) ?? null;
  const level2Answer = level1Answer?.subAnswers?.find((a) => a.key === guideSubKey2) ?? null;

  const guideResult = selectedSymptom?.categorie
    ? {
        categorie: selectedSymptom.categorie,
        explication: selectedSymptom.explication,
        services: selectedSymptom.services,
        nonPropose: undefined as string | undefined,
      }
    : level1Answer && !level1Answer.subQuestion
      ? level1Answer
      : level1Answer?.subQuestion
        ? level2Answer
        : null;

  const resetGuide = () => {
    setGuideSymptomKey(null);
    setGuideSubKey(null);
    setGuideSubKey2(null);
    setGuideServicesFilter(null);
  };

  const validerGuide = () => {
    if (!guideResult || !guideResult.categorie) return;
    setCategorie(guideResult.categorie);
    setGuideServicesFilter(guideResult.services ?? null);
    setSearchMode("category");
    setIsCatOpen(false);
  };

  // Fonction pour vérifier si une prestation est "Sur devis"
  const isSurDevis = (duree: number | string | null): boolean => {
    return duree === null || duree === undefined || duree === "Sur devis";
  };

  //! Prestations filtrées + recherche + tri alphabétique
  const prestations = useMemo(() => {
    const filtered = servicesData.filter(
      (s) =>
        // Issu du questionnaire guidé : ne montrer que la petite sélection pertinente
        // (toutes catégories confondues), pas toute la catégorie.
        (guideServicesFilter
          ? guideServicesFilter.includes(s.service)
          : searchMode === "search" || s.categorie === categorie) &&
        // Exclure UNIQUEMENT si durée est null ou non numérique
        // Le prix peut être null (ex: "À partir de X€"), seule la durée compte pour réserver
        s.duree !== null &&
        typeof s.duree === "number" &&
        // Filtrer selon la recherche
        (searchQuery === "" ||
          s.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.categorie.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (s.description &&
            s.description.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Trier par ordre alphabétique (A-Z)
    return filtered.sort((a, b) => {
      return a.service.localeCompare(b.service, 'fr');
    });
  }, [categorie, searchQuery, searchMode, guideServicesFilter]);

  //! Sélection / déselection
  const handleSelect = (service: string) => {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
    setDureeTotale(null);
    setPrixTotal(null);
  };

  //! Supprimer une intervention sélectionnée
  const removeSelected = (service: string) => {
    setSelected((prev) => prev.filter((s) => s !== service));
    setDureeTotale(null);
    setPrixTotal(null);
  };

  //! Récupérer les détails des interventions sélectionnées
  const selectedServices = servicesData.filter((s) =>
    selected.includes(s.service)
  );

  //! Conseil pièces : priorité à la prestation précise sélectionnée, sinon la catégorie
  const conseilsPieces = selected.length > 0
    ? Array.from(
        new Set(
          selected
            .map((s) => partsGuidanceByService[s])
            .filter((tip): tip is string => Boolean(tip))
        )
      )
    : [];

  //! Calcul durée et prix totaux
  const calculerDuree = (tierOverride?: VehicleTier) => {
    if (categorie === "Intervention sur devis") {
      setDureeTotale(dureePersonnalisee);
      // Prix sur devis pour "Intervention sur devis"
      setPrixTotal(null);
      return;
    }
    if (selected.length === 0) return;

    const services = servicesData.filter((s) => selected.includes(s.service));

    // Calcul durée totale
    const durees = services.map((s) =>
      typeof s.duree === "number" ? s.duree : 0
    );
    const totalDuree = durees.reduce((acc, cur) => acc + cur, 0);
    setDureeTotale(totalDuree);

    // Calcul prix total (vérifier si tous les services ont un prix numérique ou variable)
    let hasVariablePrices = false;
    let fixedPricesTotal = 0;

    for (const service of services) {
      // Prix numérique standard
      if (typeof service.prix === "number") {
        fixedPricesTotal += service.prix;
      }
      // Prix avec "à partir de" - extraire le montant et l'ajouter
      else if (
        typeof service.prix === "string" &&
        (service.prix.toLowerCase().includes("à partir de") ||
          service.prix.includes("À partir de"))
      ) {
        hasVariablePrices = true;
        // Extraire le nombre du format "À partir de XX€"
        const match = service.prix.match(/(\d+)/);
        if (match && match[1]) {
          const minimumAmount = parseInt(match[1], 10);
          if (!isNaN(minimumAmount)) {
            fixedPricesTotal += minimumAmount;
          }
        }
      }
      // Autre format de prix ou null
      else {
        hasVariablePrices = true;
      }
    }

    // Applique le multiplicateur du tarif véhicule (citadine/standard/SUV-utilitaire)
    const multiplier = VEHICLE_TIERS.find((t) => t.key === (tierOverride ?? vehicleTier))?.multiplier ?? 1;
    const adjustedTotal = Math.round(fixedPricesTotal * multiplier);

    // Si au moins un prix est variable, afficher "à partir de" + total
    if (hasVariablePrices) {
      setPrixTotal(`à partir de ${adjustedTotal}€`);
    }
    // Sinon, afficher le total numérique
    else {
      setPrixTotal(adjustedTotal);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-[#0F0F0F] to-gray-900 text-white relative">
      {/* //! Logo filigrane géant (pas prioritaire) — en CSS background pour ne jamais être
          candidat au LCP (contrairement à un <Image>, un background-image n'est jamais
          considéré comme le "Largest Contentful Paint" par le navigateur). */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/images/CAM-blanc-complet.webp)",
          backgroundSize: "min(600px, 90vw) auto",
        }}
        role="presentation"
        aria-hidden="true"
      />

      <Header />

      <main className="flex-1 container mx-auto px-4 sm:px-6 py-12 max-w-7xl relative" role="main">
        <div className="sm:mb-12 mb-4 relative max-w-5xl mx-auto">
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
            <div
              className="mt-6 bg-gray-800/50 border border-gray-700 rounded-2xl p-6 sm:p-8 shadow-lg"
              role="region"
              aria-label="Informations importantes"
            >
              <h2 className="text-lg sm:text-xl font-bold text-amber-400 mb-6 text-center">
                ℹ️ Ce qu'il faut savoir avant de réserver
              </h2>

              <div className="space-y-6">
                {/* Acompte */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center" aria-hidden="true">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2">
                      Acompte requis
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      Un acompte vous sera demandé lors de la réservation pour
                      garantir votre créneau. Le montant varie selon la durée de
                      l'intervention, de{" "}
                      <strong className="text-gray-200">
                        15 € à 70 € maximum
                      </strong>
                      .
                    </p>
                    <p className="text-xs sm:text-sm text-gray-300 mt-2 flex items-center gap-1">
                      <span className="text-green-400">✓</span> Déduit du prix final
                    </p>
                  </div>
                </div>

                {/* Achat de pièces */}
                <div className="flex items-start gap-3 pt-6 border-t border-gray-700/60">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
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
                    <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2">
                      Achat de pièces
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      Si le mécanicien doit s&#39;occuper de commander les
                      pièces, merci de{" "}
                      <strong className="text-gray-200">
                        le contacter avant de réserver
                      </strong>{" "}
                      afin de confirmer les références et le coût des pièces.
                      <br />
                      Un acompte de{" "}
                      <strong className="text-gray-200">40 %</strong> du total
                      des pièces sera demandé avant l'achat.
                    </p>
                  </div>
                </div>

                {/* Tarification selon le véhicule */}
                <div className="flex items-start gap-3 pt-6 border-t border-gray-700/60">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-200 mb-2">
                      Un tarif adapté à votre véhicule
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                      Le prix de la main d&#39;œuvre varie selon le{" "}
                      <strong className="text-gray-200">gabarit de votre véhicule</strong>{" "}
                      (citadine, berline, SUV/utilitaire) et la{" "}
                      <strong className="text-gray-200">complexité de l&#39;intervention</strong>,
                      afin de refléter au plus juste le temps de travail réel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout en 2 colonnes sur desktop pour garder le récapitulatif visible */}
        <div className="flex flex-col lg:flex-row gap-8 items-start relative">
          
          {/* Colonne de gauche : Sélection des interventions */}
          <div className="flex-1 w-full min-w-0">
            {/* Choix du mode : Recherche OU Catégorie */}
            <div className="relative mb-8 w-full max-w-3xl mx-auto pt-4 sm:pt-0 px-4 sm:px-0">
          <label className="relative z-0 block mb-6 font-semibold text-lg sm:text-xl text-amber-400 text-center">
            1. Comment souhaitez-vous trouver votre intervention ?
          </label>

          {/* Toggle entre recherche et catégorie */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
            <button
              onClick={() => {
                setSearchMode("search");
                setCategorie("");
                setGuideServicesFilter(null);
                setIsCatOpen(false);
              }}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                searchMode === "search"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sm:scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="whitespace-nowrap">Rechercher directement</span>
            </button>

            <button
              onClick={() => {
                setSearchMode("category");
                setSearchQuery("");
                setGuideServicesFilter(null);
                setIsCatOpen(false);
              }}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                searchMode === "category"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sm:scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <span className="whitespace-nowrap">Parcourir par catégorie</span>
            </button>

            <button
              onClick={() => {
                setSearchMode("guide");
                setSearchQuery("");
                setCategorie("");
                setIsCatOpen(false);
                resetGuide();
              }}
              className={`cursor-pointer flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                searchMode === "guide"
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sm:scale-105"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="whitespace-nowrap">Je ne sais pas ce qu&#39;il me faut</span>
            </button>
          </div>

          {/* Mode recherche */}
          {searchMode === "search" && (
            <div className="px-6 sm:px-0">
              <p className="text-center text-gray-400 mb-4 text-sm">
                💡 Tapez directement ce que vous cherchez (ex:
                &quot;vidange&quot;, &quot;plaquettes&quot;,
                &quot;diagnostic&quot;)
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
            <div
              className={`px-6 sm:px-0 ${
                isCatOpen && !categorie ? "pb-[60vh] sm:pb-0" : ""
              }`}
            >
              <p className="text-center text-gray-400 mb-4 text-sm">
                💡 Sélectionnez d&#39;abord une catégorie, puis choisissez vos
                interventions
              </p>
              <SelectCategorie
                categorie={categorie}
                setCategorie={(value) => {
                  setCategorie(value);
                  setGuideServicesFilter(null);
                  setDureeTotale(null);
                  setIsCatOpen(false);
                  setHasContactedMechanic(null);
                }}
                categories={categories}
                onOpenChange={setIsCatOpen}
              />
            </div>
          )}

          {/* Mode questionnaire guidé */}
          {searchMode === "guide" && (
            <div className="px-4 sm:px-0 max-w-2xl mx-auto">
              {!guideSymptomKey && (
                <>
                  <p className="text-center text-gray-400 mb-4 text-sm">
                    💡 Choisissez ce qui décrit le mieux votre situation, sans avoir besoin de vocabulaire technique
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {symptoms.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => {
                          setGuideSymptomKey(s.key);
                          setGuideSubKey(null);
                          setGuideSubKey2(null);
                        }}
                        className="cursor-pointer flex items-center gap-3 bg-gray-800/50 border-2 border-gray-700 hover:border-amber-500/60 rounded-xl p-4 text-left transition-all"
                      >
                        <span className="text-2xl">{s.emoji}</span>
                        <span className="text-gray-200 font-medium">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {selectedSymptom && selectedSymptom.subAnswers && !guideSubKey && (
                <div>
                  <button
                    onClick={resetGuide}
                    className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
                  >
                    ← Revenir à l&#39;étape précédente
                  </button>
                  <p className="text-center text-amber-400 font-semibold mb-4">
                    {selectedSymptom.subQuestion}
                  </p>
                  <div className="grid gap-3">
                    {selectedSymptom.subAnswers.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => {
                          setGuideSubKey(a.key);
                          setGuideSubKey2(null);
                        }}
                        className="cursor-pointer bg-gray-800/50 border-2 border-gray-700 hover:border-amber-500/60 rounded-xl p-4 text-left text-gray-200 font-medium transition-all"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {level1Answer && level1Answer.subQuestion && !guideSubKey2 && (
                <div>
                  <button
                    onClick={() => setGuideSubKey(null)}
                    className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
                  >
                    ← Revenir à l&#39;étape précédente
                  </button>
                  <p className="text-center text-amber-400 font-semibold mb-4">
                    {level1Answer.subQuestion}
                  </p>
                  <div className="grid gap-3">
                    {level1Answer.subAnswers?.map((a) => (
                      <button
                        key={a.key}
                        onClick={() => setGuideSubKey2(a.key)}
                        className="cursor-pointer bg-gray-800/50 border-2 border-gray-700 hover:border-amber-500/60 rounded-xl p-4 text-left text-gray-200 font-medium transition-all"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {guideResult && guideResult.nonPropose && (
                <div className="bg-gray-800/50 border-2 border-gray-600 rounded-xl p-5 sm:p-6">
                  <button
                    onClick={resetGuide}
                    className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
                  >
                    ← Revenir à l&#39;étape précédente
                  </button>
                  <p className="text-gray-200 leading-relaxed">{guideResult.nonPropose}</p>
                </div>
              )}

              {guideResult && !guideResult.categorie && !guideResult.nonPropose && guideResult.explication && (
                <div className="bg-gray-800/50 border-2 border-gray-600 rounded-xl p-5 sm:p-6">
                  <button
                    onClick={resetGuide}
                    className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
                  >
                    ← Revenir à l&#39;étape précédente
                  </button>
                  <p className="text-gray-200 leading-relaxed">💡 {guideResult.explication}</p>
                </div>
              )}

              {guideResult && guideResult.categorie && (
                <div className="bg-gray-800/50 border-2 border-amber-500/40 rounded-xl p-5 sm:p-6">
                  <button
                    onClick={resetGuide}
                    className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline mb-4"
                  >
                    ← Revenir à l&#39;étape précédente
                  </button>
                  <p className="text-gray-200 mb-5">{guideResult.explication}</p>

                  <p className="font-semibold text-amber-400 mb-3 text-sm">
                    🚗 Votre véhicule (facultatif, mais ça m&#39;aide à mieux vous conseiller)
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <select
                      value={vehicleMarque}
                      onChange={(e) => {
                        setVehicleMarque(e.target.value);
                        setVehicleModele("");
                        setVehicleModeleLibre("");
                        setVehicleMotorisation("");
                        setVehicleMotorisationLibre("");
                      }}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                    >
                      <option value="">Marque</option>
                      {marques.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    {modelesDisponibles.length > 0 ? (
                      <select
                        value={vehicleModele}
                        onChange={(e) => {
                          setVehicleModele(e.target.value);
                          setVehicleMotorisation("");
                          setVehicleMotorisationLibre("");
                        }}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                      >
                        <option value="">Modèle</option>
                        {modelesDisponibles.map((m) => (
                          <option key={m.modele} value={m.modele}>
                            {m.modele}
                          </option>
                        ))}
                        <option value={AUTRE_MODELE}>Autre / je ne trouve pas</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Modèle (ex: Partner)"
                        value={vehicleModeleLibre}
                        onChange={(e) => setVehicleModeleLibre(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                      />
                    )}

                    {vehicleModele === AUTRE_MODELE && (
                      <input
                        type="text"
                        placeholder="Précisez le modèle"
                        value={vehicleModeleLibre}
                        onChange={(e) => setVehicleModeleLibre(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                      />
                    )}

                    <input
                      type="text"
                      placeholder="Année (ex: 2015)"
                      value={vehicleAnnee}
                      onChange={(e) => setVehicleAnnee(e.target.value)}
                      className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                    />

                    {motorisationsDisponibles.length > 0 ? (
                      <select
                        value={vehicleMotorisation}
                        onChange={(e) => setVehicleMotorisation(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200"
                      >
                        <option value="">Motorisation</option>
                        {motorisationsDisponibles.map((mot) => (
                          <option key={mot} value={mot}>
                            {mot}
                          </option>
                        ))}
                        <option value={AUTRE_MODELE}>Autre / je ne sais pas</option>
                      </select>
                    ) : (
                      (vehicleModele || vehicleModeleLibre) && (
                        <input
                          type="text"
                          placeholder="Motorisation (ex: 1.5 BlueHDi 130)"
                          value={vehicleMotorisationLibre}
                          onChange={(e) => setVehicleMotorisationLibre(e.target.value)}
                          className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                        />
                      )
                    )}

                    {vehicleMotorisation === AUTRE_MODELE && (
                      <input
                        type="text"
                        placeholder="Précisez la motorisation"
                        value={vehicleMotorisationLibre}
                        onChange={(e) => setVehicleMotorisationLibre(e.target.value)}
                        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-500"
                      />
                    )}
                  </div>

                  {anneeAncienne && (vehicleModele || vehicleModeleLibre) && (
                    <p className="text-xs text-gray-400 -mt-3 mb-5">
                      💡 Les motorisations proposées concernent surtout les véhicules récents. Pour un
                      véhicule de {vehicleAnnee}, précisez la motorisation vous-même si vous la connaissez.
                    </p>
                  )}

                  <button
                    onClick={validerGuide}
                    className="cursor-pointer w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all py-3 rounded-lg font-bold text-white"
                  >
                    Voir les prestations correspondantes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Durée personnalisée pour "Intervention sur devis" */}
        {categorie === "Intervention sur devis" && (
          <div className="mb-8 max-w-2xl mx-auto">
            {/* Étape de vérification du contact préalable */}
            {hasContactedMechanic === null && (
              <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-amber-400 sm:text-xl text-base mb-4 text-center">
                  Important : Avez-vous déjà contacté le mécanicien au préalable ?
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6 text-center text-sm sm:text-base">
                  Pour les interventions sur devis, un contact préalable avec
                  Christophe est nécessaire afin de discuter de votre besoin et
                  d'établir ensemble la durée estimée des travaux.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6" role="group" aria-label="Confirmation du contact préalable">
                  <button
                    onClick={() => setHasContactedMechanic(true)}
                    className="cursor-pointer px-6 py-3 bg-green-700 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    aria-label="Oui, j'ai déjà contacté le mécanicien"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Oui, j'ai déjà discuté avec Christophe</span>
                  </button>
                  <button
                    onClick={() => setHasContactedMechanic(false)}
                    className="cursor-pointer px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    aria-label="Non, je n'ai pas encore contacté le mécanicien"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Non, pas encore</span>
                  </button>
                </div>
              </div>
            )}
            
            {/* Si pas de contact préalable, afficher les options de contact */}
            {hasContactedMechanic === false && (
              <div className="mb-6 bg-red-900/30 border-2 border-red-500/50 rounded-xl p-5" role="alert" aria-labelledby="contact-warning-title">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-500/30 border border-red-400/50 flex items-center justify-center" aria-hidden="true">
                    <svg
                      className="w-6 h-6 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 id="contact-warning-title" className="font-bold text-red-400 sm:text-lg text-base mt-1 mb-2">
                      CONTACT PRÉALABLE REQUIS
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      Pour réserver cette catégorie d&#39;intervention, vous devez{" "}
                      <strong>
                        obligatoirement contacter Christophe au préalable
                      </strong>{" "}
                      afin d&#39;établir avec lui la durée estimée des travaux.
                    </p>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mt-3" role="group" aria-label="Options de contact">
                      <Whatsapp
                        message="Bonjour Christophe, j'aimerais réserver une intervention personnalisée. Pouvez-vous m'aider à déterminer la durée nécessaire ?"
                        label="WhatsApp (réponse rapide)"
                        size="sm"
                        className="w-full sm:w-auto"
                      />
                      <a
                        href="/contact"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors border border-gray-600"
                        aria-label="Accéder à la page de contact"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        <span>Page Contact</span>
                      </a>
                      <a
                        href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm transition-colors border border-gray-600"
                        aria-label="Appeler Christophe au téléphone"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span>Appeler</span>
                      </a>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-red-500/30">
                      <button 
                        onClick={() => setHasContactedMechanic(null)}
                        className="cursor-pointer text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
                        aria-label="Revenir à la question précédente"
                      >
                        Revenir à l'étape précédente
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Si contact préalable confirmé, afficher le sélecteur de durée */}
            {hasContactedMechanic === true && (
              <>
                <div className="mb-6 bg-green-600/20 border-2 border-green-500/50 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-500/30 border border-green-400/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-green-400 text-base sm:text-lg mb-2 ">
                        Contact préalable confirmé
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                        Parfait ! Vous pouvez sélectionner la durée
                        d'intervention estimée par Christophe pour réserver
                        votre créneau.
                      </p>
                      
                      <div className="mt-4 pt-3 border-t border-green-500/30">
                        <button 
                          onClick={() => setHasContactedMechanic(null)}
                          className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors"
                        >
                          Revenir à l'étape précédente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <label className="block mb-3 font-semibold text-lg text-amber-400">
                  2. Choisissez la durée de l&#39;intervention
                </label>
                <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-6">
                  <p className="text-amber-400 mb-4 text-sm">
                    🕒 Ajustez la durée estimée avec le curseur :
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
              </>
            )}
          </div>
        )}

        {/* Prestations - Afficher si : (mode recherche + recherche active) OU (mode catégorie + catégorie sélectionnée) */}
        {((searchMode === "search" && searchQuery) ||
          (searchMode === "category" &&
            categorie &&
            categorie !== "Intervention sur devis")) && (
          <div className="mb-8 relative z-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <label className="font-semibold text-lg text-amber-400">
                2. Sélectionnez vos interventions
              </label>

              {/* Légende des couleurs */}
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
              </div>
            </div>

            {categorie && (
              <div className="mb-5 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-gray-300 space-y-2">
                {conseilsPieces.length > 0 ? (
                  conseilsPieces.map((tip, i) => (
                    <p key={i}>
                      💡 <strong className="text-blue-300">Conseil pièces :</strong> {tip}
                    </p>
                  ))
                ) : (
                  <p>
                    💡 <strong className="text-blue-300">Conseil pièces :</strong>{" "}
                    {partsGuidance[categorie] ?? defaultPartsGuidance}
                  </p>
                )}
              </div>
            )}

            {prestations.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 border border-gray-700 rounded-xl">
                <p className="text-gray-400 text-lg mb-4">
                  {searchMode === "category" && !categorie 
                    ? "👆 Veuillez sélectionner une catégorie ci-dessus pour afficher les interventions."
                    : searchQuery 
                      ? `Aucune intervention trouvée pour "${searchQuery}"`
                      : "Aucune intervention trouvée"}
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
                    prix={p.prix}
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

          </div>

          {/* Colonne de droite : Récapitulatif (Sticky) */}
          {(selected.length > 0 || (categorie === "Intervention sur devis" && hasContactedMechanic === true)) && (
            <div className="w-full lg:w-[280px] xl:w-[320px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-6">
              
              {/* Interventions sélectionnées */}
              {selected.length > 0 && (
          <div className="mb-8 w-full mx-auto">
            <div className="bg-gradient-to-r from-amber-500/10 to bg-gray-800/30 border border-amber-500/20 rounded-xl p-3 sm:p-5 shadow-lg">
              <div className="flex flex-row flex-wrap items-center justify-between gap-3 mb-4">
                <h3 className="text-base md:text-lg font-bold text-amber-400 flex items-center gap-2">
                  <InfoModal />
                  Sélection
                </h3>
                <div className="flex items-center gap-2 shrink-0">
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
                      setPrixTotal(null);
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
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-base sm:text-lg text-amber-400 font-bold leading-none">
                          {service.prix !== undefined && service.prix !== null
                            ? typeof service.prix === "number"
                              ? `${service.prix}€`
                              : service.prix
                            : "Sur devis"}
                        </span>
                        {service.duree !== null && service.duree !== "Sur devis" && (
                          <span
                            className={`text-xs font-medium whitespace-nowrap px-2 py-0.5 rounded border ${
                              getColorClasses(service.duree).badge
                            }`}
                          >
                            ⏱ {formatDuree(service.duree)}
                          </span>
                        )}
                      </div>
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
              {/* Sélecteur de gabarit véhicule - influence le tarif horaire affiché */}
        {(selected.length > 0 || (categorie === "Intervention sur devis" && hasContactedMechanic === true)) && (
          <div className="max-w-2xl mx-auto mb-6">
            <p className="text-center text-sm text-gray-300 mb-3">Quelle est la taille de votre véhicule ?</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VEHICLE_TIERS.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => {
                    setVehicleTier(tier.key);
                    if (dureeTotale !== null) calculerDuree(tier.key);
                  }}
                  className={`cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center transition-all ${
                    vehicleTier === tier.key
                      ? "border-amber-500 bg-amber-500/10"
                      : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                  }`}
                >
                  <p className="font-semibold text-sm text-gray-100">{tier.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{tier.examples}</p>
                </button>
              ))}
            </div>
          </div>
        )}
              {/* Bouton Calcul - Afficher si des interventions sont sélectionnées ou si c'est sur devis ET qu'il y a eu contact préalable */}
        {(selected.length > 0 || (categorie === "Intervention sur devis" && hasContactedMechanic === true)) && (
          <div className="text-center mb-10">
            <button
              onClick={() => {
                calculerDuree();
                setShowReservationWarning(true); // 👉 affiche l'encart après calcul
                setTimeout(() => {
                  document.getElementById("resultat-reservation")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 transition-all px-3 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
            >
              {categorie === "Intervention sur devis"
                ? `✓ Réserver`
                : `✓ Calculer le tarif`}
            </button>
          </div>
        )}

            </div>
          )}
        </div>

        {/* Résultat (déplacé sous le bloc principal) */}
        {dureeTotale && (
          <div id="resultat-reservation" className="space-y-8 mt-12 w-full max-w-4xl mx-auto scroll-mt-24">
            <div className="space-y-2 max-w-md mx-auto bg-gray-800/40 rounded-xl p-4 border border-amber-500/20">
              <p className="text-center text-lg flex items-center justify-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-300">
                  {categorie === "Intervention sur devis"
                    ? "Durée sélectionnée"
                    : "Durée totale estimée"}{" "}
                  :
                </span>{" "}
                <span className="font-bold text-amber-400">
                  {formatDuree(dureeTotale)}
                </span>
              </p>

              {prixTotal !== null && (
                <div className="space-y-2">
                  <p className="text-center text-lg flex items-center justify-center gap-2 mt-2">
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    <span className="text-gray-300">Prix total :</span>{" "}
                    <span className="font-bold text-amber-400">
                      {typeof prixTotal === "number"
                        ? `${prixTotal}€`
                        : prixTotal}
                    </span>
                  </p>

                  {typeof prixTotal === "string" &&
                    prixTotal.includes("à partir de") && (
                      <p className="text-center text-xs text-blue-300 mt-1">
                        <svg
                          className="w-4 h-4 inline mr-1 mb-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Le tarif exact sera déterminé par le mécanicien après
                        vérification du modèle et de l’état de votre véhicule,
                        afin de garantir un prix juste et adapté.
                      </p>
                    )}
                </div>
              )}
            </div>
            {categorie === "Intervention sur devis" && (
              <p className="text-center text-sm text-gray-400 -mt-4">
                💬 Intervention personnalisée nécessitant un devis préalable
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
                  <Whatsapp
                    message="Bonjour Christophe, je souhaite planifier une intervention longue (plus d'une journée)."
                    label="Sur WhatsApp"
                  />
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 transition px-6 py-3 rounded-lg font-semibold text-white shadow-md border border-gray-600"
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
                </div>
              </div>
            ) : (
              <ZoneBooking
                dureeTotale={dureeTotale}
                vehicleTierLabel={VEHICLE_TIERS.find((t) => t.key === vehicleTier)?.label}
                vehicleTierKey={vehicleTier}
                estimatedPrice={typeof prixTotal === "number" ? prixTotal : undefined}
                selectedServiceNames={selected}
              />
            )}
          </div>
        )}

        {/* Espace fixe pour que le footer reste toujours en bas */}
        <div className="h-0"></div>
      </main>

      <Footer />
    </div>
  );
}
