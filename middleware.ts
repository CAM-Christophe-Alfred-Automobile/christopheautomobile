// -----------------------------------------------------------------------------
//! 🔐 MIDDLEWARE : Protection par mot de passe (Basic Auth) pour la période de démo
// -----------------------------------------------------------------------------
//
//! 🎯 OBJECTIF :
// Protéger l'accès au site avec un mot de passe pendant la phase de développement
// ou de démonstration client.
//
//! 💡 ACTIVATION :
// Ajouter dans .env :
//   DEMO_USER=votre-username
//   DEMO_PASSWORD=votre-mot-de-passe
//
// Si ces variables ne sont pas définies, le site est accessible sans mot de passe.
//
//! 🔒 SÉCURITÉ :
// - Authentification HTTP Basic (standard navigateur)
// - Impossible à contourner côté client
// - Protège toutes les pages sauf les assets statiques
//
//! ⚠️ À SUPPRIMER EN PRODUCTION :
// Une fois le site validé par le client, supprimer les variables DEMO_USER
// et DEMO_PASSWORD du .env de production.
// -----------------------------------------------------------------------------

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  //! Déclaration de la fonction middleware exécutée sur chaque requête
  const basicAuth = request.headers.get("authorization"); 
  //! Récupère l'entête Authorization envoyé par le navigateur (Basic Auth)

  const authUser = process.env.DEMO_USER;
  const authPass = process.env.DEMO_PASSWORD;
  //! Identifiant et mot de passe définis dans les variables d’environnement

  // Si pas configuré => accès normal (production)
  if (!authUser || !authPass) {
    //! Si les variables ne sont pas définies => pas de protection
    return NextResponse.next();
    //! NextResponse.next() = laisse passer la requête normalement
  }

  // Vérification des credentials
  if (basicAuth) {
    //! Si le header Authorization existe => on vérifie
    try {
      const authValue = basicAuth.split(" ")[1];
      //! basicAuth a la forme : "Basic base64EncodedString"
      //! On récupère la partie encodée en base64

      const decoded = Buffer.from(authValue, "base64").toString();
      //! Remplace atob() → Compatible Edge Runtime (Vercel)

      const [user, pass] = decoded.split(":");
      //! On sépare en user / password

      if (user === authUser && pass === authPass) {
        //! Si identifiant ET mot de passe sont corrects
        return NextResponse.next();
        //! On autorise l’accès
      }
    } catch (error) {
      //! Si une erreur se produit lors du décodage
      console.error("Erreur d'authentification:", error);
      //! Log optionnel en console (serveur)
    }
  }

  //! Accès refusé
  return new Response("🔒 Accès réservé - Site en cours de développement", {
    //! Si aucune condition précédente n’est valide → accès refusé
    status: 401,
    //! Code HTTP 401 = Authentification requise

    headers: {
      "WWW-Authenticate": 'Basic realm="Site CAM - Démo Client"',
      //! Demande au navigateur d'afficher une popup de login
    },
  });
}

// Configuration : protège toutes les routes sauf les assets
export const config = {
  matcher: [
    //! Le middleware s’applique aux routes correspondantes au pattern suivant
    
    /*
     * Match toutes les routes sauf :
     * - _next/static (fichiers statiques Next.js)
     * - _next/image (optimisation d'images)
     * - favicon.ico, robots.txt, sitemap.xml
     * - Fichiers dans /public (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)",
    //! Expression régulière : exclut les fichiers statiques pour éviter des erreurs
  ],
};
