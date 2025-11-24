/**
 * ============================================================================
 * 📄 COMPOSANT : NeonCAM
 * ============================================================================
 * Panneau néon animé du logo "CAM"
 *
 * 🎯 OBJECTIF :
 * - Afficher le logo principal du site sous forme de panneau néon animé
 * - Effet vintage et réaliste de scintillement comme dans un garage
 * - Animation interactive au survol
 *
 * 📍 UTILISÉ DANS :
 * - /src/components/home/HeroSection.tsx (page d'accueil)
 *
 * ⚙️ TECHNOLOGIES UTILISÉES :
 * - Framer Motion → pour les animations (scintillement, hover 3D, halo, etc.)
 * - Tailwind CSS → pour la mise en forme et les effets (ombre, gradient, bordure)
 * - Fonts personnalisées → Rampart One (titre "CAM") + Racing Sans One (sous-texte)
 *
 * 🧱 STRUCTURE DU COMPOSANT :
 * 1️⃣ Conteneur principal centré
 * 2️⃣ Bloc 3D interactif (rotation + glow au survol)
 * 3️⃣ Panneau métallique avec texture + rivets
 * 4️⃣ Halo lumineux animé (effet d'ambiance)
 * 5️⃣ Texte principal "CAM" (effet néon animé lettre par lettre)
 * 6️⃣ Sous-texte "Christophe Auto-mobile"
 * 7️⃣ Badge "OUVERT" animé (clignotement vert)
 *
 * 🎨 DESIGN :
 * - Couleur néon principale : Amber (#f59e0b)
 * - Bordure métallique gris foncé
 * - Halo jaune diffus simulant la lumière néon
 * - Badge vert lumineux pour le statut "OUVERT"
 * ============================================================================
 */

"use client"; // ✅ Nécessaire car Framer Motion s’exécute côté client

import { motion } from "framer-motion";
import { racing, rampartOne } from "@/fonts";

/**
 * ============================================================================
 * 🏷️ COMPOSANT : NeonCAM
 * ============================================================================
 * Affiche le logo "CAM" avec animation néon, halo et effet 3D au survol.
 */
export default function NeonCAM() {
  return (
    // 🎯 Conteneur principal centré horizontalement et verticalement
    <div className="flex justify-center items-center">

      {/* --------------------------------------------------------------------------
          ⚙️ CONTENEUR INTERACTIF (3D + Scale au survol)
          --------------------------------------------------------------------------
          - Utilise `whileHover` de Framer Motion pour une interaction fluide.
          - Légère rotation 3D et effet d’agrandissement au passage de la souris.
      */}
      <motion.div 
        className="relative"
        whileHover={{ 
          scale: 1.05,      // ✨ Zoom léger sur le panneau
          rotateY: 5,       // 🔄 Inclinaison 3D sur l'axe Y
          rotateX: -2,      // 🔄 Légère rotation sur l'axe X
        }}
        transition={{ 
          type: "spring",   // 🌊 Animation à effet ressort
          stiffness: 300,   // ⚡ Élasticité du mouvement
          damping: 20       // 🎯 Amortissement pour éviter le rebond
        }}
        style={{ perspective: 1000 }} // 📐 Profondeur 3D réaliste
      >

        {/* --------------------------------------------------------------------------
            🪶 PANNEAU PRINCIPAL
            --------------------------------------------------------------------------
            - Fond sombre avec dégradé et bordure métallique épaisse.
            - Contient tous les éléments (rivets, halo, texte, badge).
        */}
        <motion.div 
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-lg shadow-2xl border-8 border-gray-700 p-5 cursor-pointer"
          whileHover={{
            boxShadow: "0 0 40px rgba(245, 158, 11, 0.6), 0 0 80px rgba(245, 158, 11, 0.3)", // 💡 Halo amber intense au survol
          }}
        >

          {/* --------------------------------------------------------------------------
              🔩 RIVETS MÉTALLIQUES (Décoratifs)
              --------------------------------------------------------------------------
              - 4 petits cercles gris dans les coins du panneau pour simuler un cadre vissé.
          */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-gray-600 rounded-full border border-gray-500"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-gray-600 rounded-full border border-gray-500"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-gray-600 rounded-full border border-gray-500"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-gray-600 rounded-full border border-gray-500"></div>

          {/* --------------------------------------------------------------------------
              🧱 TEXTURE DE FOND (Effet grunge)
              --------------------------------------------------------------------------
              - Texture SVG subtile en superposition pour un effet "métal usé".
          */}
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0ic2NyYXRjaCIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjIwMCIgeTI9IjIwMCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NjcmF0Y2gpIi8+PC9zdmc+')]"></div>

          {/* --------------------------------------------------------------------------
              💡 HALO LUMINEUX AMBER (Éclairage diffus)
              --------------------------------------------------------------------------
              - Grand cercle flou animé pour simuler la lumière néon ambiante.
          */}
          <div className="absolute inset-0 flex justify-center items-center -z-10">
            <motion.div
              className="w-[600px] h-[400px] bg-amber-500/20 blur-[120px] rounded-full"
              animate={{
                opacity: [0.3, 0.15, 0.4, 0.2, 0.35], // 🔁 Variation d’intensité lumineuse
                scale: [1, 1.15, 0.9, 1.1, 1],        // 🔁 Effet de respiration douce
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* --------------------------------------------------------------------------
              ✨ TEXTE PRINCIPAL "CAM"
              --------------------------------------------------------------------------
              - Couleur amber néon (#f59e0b)
              - Effet de scintillement animé avec text-shadow variable
              - Chaque lettre a un pattern d’opacité différent pour un rendu réaliste
          */}
          <motion.h1
            className={`${rampartOne.className} text-8xl sm:text-9xl font-extrabold tracking-widest text-center`}
            style={{
              color: "#f59e0b",
              textShadow:
                "0 0 30px #f59e0b, 0 0 60px #d97706, 0 0 90px #d97706", // 💥 Glow multicolore amber
            }}
            animate={{
              opacity: [1, 0.4, 1, 0.6, 0.3, 1, 0.5, 1, 0.7, 1], // 🔁 Scintillement global
              textShadow: [
                "0 0 30px #b45309, 0 0 60px #d97706, 0 0 90px #d97706",
                "0 0 10px #d97706, 0 0 20px #b45309",
                "0 0 40px #b45309, 0 0 80px #d97706, 0 0 120px #d97706",
                "0 0 15px #d97706, 0 0 30px #b45309",
                "0 0 5px #b45309",
                "0 0 35px #b45309, 0 0 70px #d97706, 0 0 100px #d97706",
                "0 0 12px #d97706, 0 0 25px #b45309",
                "0 0 45px #b45309, 0 0 90px #d97706, 0 0 130px #d97706",
                "0 0 20px #d97706, 0 0 40px #b45309",
                "0 0 30px #b45309, 0 0 60px #d97706, 0 0 90px #d97706",
              ],
              filter: [
                "brightness(1)",
                "brightness(0.5)",
                "brightness(1.3)",
                "brightness(0.7)",
                "brightness(0.4)",
                "brightness(1.2)",
                "brightness(0.6)",
                "brightness(1.4)",
                "brightness(0.8)",
                "brightness(1)",
              ],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.12, 0.18, 0.28, 0.35, 0.45, 0.55, 0.7, 0.85, 1],
            }}
          >
            {/* 🔠 Animation individuelle des lettres C, A, M */}
            <motion.span
              className="inline-block"
              animate={{
                opacity: [1, 0.3, 1, 1, 0.5, 1],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: 0,
              }}
            >
             
             C
            </motion.span>
            <motion.span
              className="inline-block"
              animate={{
                opacity: [1, 1, 0.4, 1, 1, 0.6, 1],
              }}
              transition={{
                duration: 4.1,
                repeat: Infinity,
                delay: 0.6,
              }}
            >
              A
            </motion.span>
            <motion.span
              className="inline-block"
              animate={{
                opacity: [1, 0.5, 1, 0.3, 1, 1],
              }}
              transition={{
                duration: 3.7,
                repeat: Infinity,
                delay: 1.2,
              }}
            >
              M
            </motion.span>
          </motion.h1>

          {/* --------------------------------------------------------------------------
              🏁 TEXTE SECONDAIRE "Christophe Auto-Mobile"
              --------------------------------------------------------------------------
              - Police Racing Sans One
              - Couleur gris clair
              - Positionné sous le néon principal
          */}
          <div className="text-center mt-3">
            <div className={`${racing.className} text-gray-300 text-xl font-extralight tracking-widest`}>
              
            </div>
          </div>

          {/* --------------------------------------------------------------------------
              🟢 BADGE "OUVERT"
              --------------------------------------------------------------------------
              - Petit badge vert animé pour indiquer la disponibilité
              - Animation pulsée continue (éclat + scale)
          */}
          <motion.div
            className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-full border-4 border-green-800 shadow-lg"
            animate={{
              opacity: [1, 0.3, 1],
              scale: [1, 0.95, 1],
              boxShadow: [
                "0 0 20px rgba(34, 197, 94, 0.8)",
                "0 0 5px rgba(34, 197, 94, 0.3)",
                "0 0 20px rgba(34, 197, 94, 0.8)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <span className="font-bold text-sm">OUVERT</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
