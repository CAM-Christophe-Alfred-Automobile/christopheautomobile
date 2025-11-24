/**
 * ============================================================================
 * 📄 FICHIER : page.tsx (Page d'accueil) - VERSION SIMPLIFIÉE
 * ============================================================================
 * 
 * Page principale du site CAM — elle assemble les différentes sections
 * 
 * ============================================================================
 * 📐 STRUCTURE :
 * ============================================================================
 * 1️⃣ HERO SECTION → Présentation principale (badge, texte, image, CTA, stats)
 * 2️⃣ PRESTATIONS SECTION → Liste des 4 prestations principales
 * 3️⃣ ATELIER SECTION → Engagements, zone d'intervention, CTA
 * ============================================================================
 */

"use client";

import { Header, Footer } from "@/components";
import { 
  HeroSection, 
  PrestationsSection, 
  AtelierSection 
} from "@/components/home";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <Header />

      {/* Section 1 : Hero */}
      <HeroSection />

      {/* Section 2 : Prestations */}
      <PrestationsSection />

      {/* Section 3 : Atelier Mobile */}
      <AtelierSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
