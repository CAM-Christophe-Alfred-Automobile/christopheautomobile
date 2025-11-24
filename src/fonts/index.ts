// -----------------------------------------------------------------------------
// Fichier : src/fonts/index.ts
// -----------------------------------------------------------------------------
// 🎯 Objectif : centraliser toutes les polices Google utilisées dans le projet
// -----------------------------------------------------------------------------

import { Rampart_One, Racing_Sans_One, Lato } from "next/font/google";



// Police racing (style automobile) pour le texte dans le panneau lumineux "Christophe auto_mobile"
export const racing = Racing_Sans_One({
  subsets: ["latin"],
  weight: "400",
});


// Police techno (logo / titre) pour CAM dans panneau lumineux
export const rampartOne = Rampart_One({
  subsets: ["latin"],
  weight: "400",
});

// Police montserrat pour le texte de présentation
export const lato = Lato({
  subsets: ["latin"],
  weight: "400",
});
