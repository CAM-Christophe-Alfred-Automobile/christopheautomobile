/**
 * ============================================================================
 * 📄 COMPOSANT : MapZone
 * ============================================================================
 * Carte interactive Leaflet avec zone d'intervention
 * 
 * 🎯 OBJECTIF :
 * - Afficher une carte centrée sur Salon-de-Provence
 * - Visualiser la zone d'intervention avec un cercle bleu
 * - Rayon configurable via variable d'environnement
 * - Marqueur et popup informatifs
 * 
 * 📍 UTILISÉ DANS :
 * - /src/app/contact/page.tsx (page de contact)
 * - Chargé avec dynamic() + { ssr: false } (Leaflet nécessite le client)
 * 
 * 🔧 CONFIGURATION :
 * - Centre : Salon-de-Provence (43.6415, 5.0973)
 * - Rayon : NEXT_PUBLIC_RAYON_INTERVENTION (depuis .env)
 * - Tiles : OpenStreetMap (gratuit)
 * 
 * 🎨 FONCTIONNALITÉS :
 * - Carte interactive (zoom, déplacement)
 * - Cercle bleu représentant la zone d'intervention
 * - Marqueur au centre avec popup
 * - Correction du bug d'icônes Leaflet + Next.js
 * 
 * ⚙️ IMPORTANT :
 * - Ne fonctionne que côté client (pas de SSR)
 * - Doit être importé avec dynamic(() => import(), { ssr: false })
 * 
 * 💡 AVANTAGES :
 * - Visualisation claire de la zone de service
 * - Interface familière (OpenStreetMap)
 * - Gratuit et performant
 * ============================================================================
 */

"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

// Coordonnées du centre (Salon-de-Provence)
const center: [number, number] = [43.6415, 5.0973];

export default function MapZone() {
  const [isClient, setIsClient] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Indiquer que nous sommes côté client
    setIsClient(true);

    // Détecter si on est sur mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    const cleanup = () => window.removeEventListener('resize', checkMobile);

    // Configuration des icônes Leaflet côté client
    if (typeof window !== "undefined") {
      // Correction du bug d'icônes manquantes (Leaflet + Next.js)
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.Marker.prototype.options.icon = DefaultIcon;
    }

    // Forcer un nouveau rendu de la carte pour éviter les erreurs de réutilisation
    setMapKey(prev => prev + 1);
    
    return cleanup;
  }, []);

  // Zoom adaptatif selon la taille d'écran
  const zoom = isMobile ? 8 : 8.5;

  // Afficher un placeholder pendant le chargement côté client
  if (!isClient) {
    return (
      <div className="w-full h-[250px] rounded-lg overflow-hidden shadow-lg bg-gray-700 flex items-center justify-center text-gray-400">
        Chargement de la carte...
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 🌍 Rayon dynamique depuis le .env
  // Leaflet attend une valeur en mètres → conversion km → m
  // -------------------------------------------------------------------------
  const rayonKm = Number(siteConfig.rayonIntervention) || 40;
  const rayonMetres = rayonKm * 1000;

  return (
    <div className="w-full h-[250px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        key={`map-zone-${mapKey}`} // Clé dynamique pour forcer la recréation
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        attributionControl={true}
        whenReady={() => {
          // S'assurer que la carte est prête avant d'ajouter les couches
        }}
      >
        {/* Fond de carte */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Zone d’intervention (rayon dynamique) */}
        <Circle
          center={center}
          radius={rayonMetres}
          pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.2 }}
        />

        {/* Marqueur principal */}
        <Marker position={center}>
          <Popup>
            🚗 Zone d&apos;intervention : {rayonKm} km autour de {siteConfig.city}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
