export const marques = [
  "Peugeot",
  "Renault",
  "Citroën",
  "Volkswagen",
  "Audi",
  "BMW",
  "Mercedes",
  "Ford",
  "Opel",
  "Fiat",
  "Toyota",
  "Nissan",
  "Dacia",
  "Seat",
  "Skoda",
  "Autre",
];

export const carburants = ["Essence", "Diesel", "Hybride", "Électrique", "GPL", "Je ne sais pas"];

export interface ModeleEntry {
  modele: string;
  motorisations: string[];
}

// Modèles et motorisations les plus courants par marque (marché français).
// Liste non exhaustive : un modèle absent reste saisissable en texte libre ("Autre").
export const modelesParMarque: Record<string, ModeleEntry[]> = {
  Peugeot: [
    { modele: "208", motorisations: ["1.2 PureTech 75", "1.2 PureTech 100", "1.2 PureTech 130", "1.5 BlueHDi 100"] },
    { modele: "2008", motorisations: ["1.2 PureTech 100", "1.2 PureTech 130", "1.5 BlueHDi 100"] },
    { modele: "308", motorisations: ["1.2 PureTech 110", "1.2 PureTech 130", "1.5 BlueHDi 130"] },
    { modele: "3008", motorisations: ["1.2 PureTech 130", "1.6 PureTech 180", "2.0 BlueHDi 180"] },
    { modele: "5008", motorisations: ["1.2 PureTech 130", "1.5 BlueHDi 130"] },
    { modele: "Partner", motorisations: ["1.5 BlueHDi 100", "1.5 BlueHDi 130"] },
  ],
  Renault: [
    { modele: "Clio", motorisations: ["1.0 TCe 90", "1.0 TCe 100", "1.5 Blue dCi 100"] },
    { modele: "Captur", motorisations: ["1.0 TCe 90", "1.3 TCe 140", "1.5 Blue dCi 115"] },
    { modele: "Mégane", motorisations: ["1.3 TCe 140", "1.5 Blue dCi 115"] },
    { modele: "Scénic", motorisations: ["1.3 TCe 140", "1.5 Blue dCi 115"] },
    { modele: "Kadjar", motorisations: ["1.3 TCe 140", "1.5 Blue dCi 115"] },
    { modele: "Kangoo", motorisations: ["1.3 TCe 100", "1.5 Blue dCi 95"] },
  ],
  Citroën: [
    { modele: "C3", motorisations: ["1.2 PureTech 83", "1.2 PureTech 110", "1.5 BlueHDi 100"] },
    { modele: "C4", motorisations: ["1.2 PureTech 130", "1.5 BlueHDi 130"] },
    { modele: "C4 Picasso", motorisations: ["1.2 PureTech 130", "1.6 BlueHDi 120"] },
    { modele: "C5 Aircross", motorisations: ["1.2 PureTech 130", "1.5 BlueHDi 130"] },
    { modele: "Berlingo", motorisations: ["1.5 BlueHDi 100", "1.5 BlueHDi 130"] },
  ],
  Volkswagen: [
    { modele: "Polo", motorisations: ["1.0 TSI 95", "1.0 TSI 110", "1.6 TDI 95"] },
    { modele: "Golf", motorisations: ["1.0 TSI 110", "1.5 TSI 130", "2.0 TDI 115"] },
    { modele: "Tiguan", motorisations: ["1.5 TSI 130", "2.0 TDI 150"] },
    { modele: "Passat", motorisations: ["1.5 TSI 150", "2.0 TDI 150"] },
    { modele: "T-Roc", motorisations: ["1.0 TSI 110", "1.5 TSI 150"] },
    { modele: "Caddy", motorisations: ["1.6 TDI 102", "2.0 TDI 122"] },
  ],
  Audi: [
    { modele: "A1", motorisations: ["1.0 TFSI 95", "1.0 TFSI 116"] },
    { modele: "A3", motorisations: ["1.0 TFSI 110", "1.5 TFSI 150", "2.0 TDI 116"] },
    { modele: "A4", motorisations: ["2.0 TFSI 190", "2.0 TDI 150"] },
    { modele: "Q3", motorisations: ["1.5 TFSI 150", "2.0 TDI 150"] },
    { modele: "Q5", motorisations: ["2.0 TFSI 252", "2.0 TDI 190"] },
  ],
  BMW: [
    { modele: "Série 1", motorisations: ["116i 109", "118d 150"] },
    { modele: "Série 3", motorisations: ["318i 156", "320d 190"] },
    { modele: "X1", motorisations: ["sDrive18i", "sDrive18d"] },
    { modele: "X3", motorisations: ["xDrive20i", "xDrive20d"] },
  ],
  Mercedes: [
    { modele: "Classe A", motorisations: ["A180 136", "A200d 150"] },
    { modele: "Classe B", motorisations: ["B180 136", "B200d 150"] },
    { modele: "Classe C", motorisations: ["C180 156", "C220d 194"] },
    { modele: "GLA", motorisations: ["GLA200 163", "GLA200d 150"] },
  ],
  Ford: [
    { modele: "Fiesta", motorisations: ["1.0 EcoBoost 95", "1.0 EcoBoost 125", "1.5 TDCi 85"] },
    { modele: "Focus", motorisations: ["1.0 EcoBoost 125", "1.5 EcoBlue 120"] },
    { modele: "Kuga", motorisations: ["1.5 EcoBoost 150", "2.0 EcoBlue 150"] },
    { modele: "Puma", motorisations: ["1.0 EcoBoost 125", "1.5 EcoBlue 120"] },
    { modele: "Transit Connect / Custom", motorisations: ["1.5 EcoBlue 100", "2.0 EcoBlue 130"] },
  ],
  Opel: [
    { modele: "Corsa", motorisations: ["1.2 75", "1.2 Turbo 100", "1.5 Diesel 100"] },
    { modele: "Astra", motorisations: ["1.2 Turbo 110", "1.5 Diesel 122"] },
    { modele: "Crossland", motorisations: ["1.2 Turbo 110", "1.5 Diesel 110"] },
    { modele: "Grandland", motorisations: ["1.2 Turbo 130", "1.5 Diesel 130"] },
  ],
  Fiat: [
    { modele: "500", motorisations: ["1.0 Hybrid 70", "0.9 TwinAir 85"] },
    { modele: "Panda", motorisations: ["1.0 Hybrid 70", "1.2 69"] },
    { modele: "Tipo", motorisations: ["1.4 95", "1.6 MultiJet 120"] },
    { modele: "Doblo", motorisations: ["1.6 MultiJet 95", "1.6 MultiJet 120"] },
  ],
  Toyota: [
    { modele: "Yaris", motorisations: ["1.5 Hybride 116", "1.0 VVT-i 72"] },
    { modele: "Corolla", motorisations: ["1.8 Hybride 122", "2.0 Hybride 196"] },
    { modele: "C-HR", motorisations: ["1.8 Hybride 122", "2.0 Hybride 184"] },
    { modele: "RAV4", motorisations: ["2.5 Hybride 218"] },
    { modele: "Proace", motorisations: ["1.5 Diesel 120", "2.0 Diesel 150"] },
  ],
  Nissan: [
    { modele: "Micra", motorisations: ["1.0 IG-T 92", "1.5 dCi 90"] },
    { modele: "Juke", motorisations: ["1.0 DIG-T 114"] },
    { modele: "Qashqai", motorisations: ["1.3 DIG-T 140", "1.5 dCi 115"] },
    { modele: "X-Trail", motorisations: ["1.3 DIG-T 158", "1.7 dCi 150"] },
  ],
  Dacia: [
    { modele: "Sandero", motorisations: ["1.0 TCe 90", "1.0 TCe 100", "1.5 Blue dCi 95"] },
    { modele: "Duster", motorisations: ["1.0 TCe 90", "1.3 TCe 130", "1.5 Blue dCi 115"] },
    { modele: "Logan", motorisations: ["1.0 TCe 90", "1.5 Blue dCi 95"] },
    { modele: "Jogger", motorisations: ["1.0 TCe 110", "1.6 Hybrid 140"] },
  ],
  Seat: [
    { modele: "Ibiza", motorisations: ["1.0 TSI 95", "1.0 TSI 110"] },
    { modele: "Leon", motorisations: ["1.0 TSI 110", "1.5 TSI 150", "2.0 TDI 115"] },
    { modele: "Arona", motorisations: ["1.0 TSI 95", "1.0 TSI 110"] },
    { modele: "Ateca", motorisations: ["1.5 TSI 150", "2.0 TDI 150"] },
  ],
  Skoda: [
    { modele: "Fabia", motorisations: ["1.0 MPI 65", "1.0 TSI 110"] },
    { modele: "Octavia", motorisations: ["1.5 TSI 150", "2.0 TDI 116"] },
    { modele: "Karoq", motorisations: ["1.0 TSI 116", "2.0 TDI 150"] },
    { modele: "Kodiaq", motorisations: ["1.5 TSI 150", "2.0 TDI 150"] },
  ],
};
