interface SiteConfig {
  name: string;
  description: string;
  url: string;
  phone: string;
  email: string; // ✅ Email public du site
  address: string;
  rayonIntervention: string;
  city: string; // ✅ nouveau champ
  legal: {
    siret: string;
    ownerName: string; // Nom complet du propriétaire
  };
  contact: {
    email: string;
    receiver: string;
  };
  smtp: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
  };
  calcom: {
    username: string;
    iframeUrl: string;
  };
  whatsapp: {
    number: string;
  };
  autodoc: {
    referralCode: string;
    referralUrl: string;
  };
}

export const siteConfig: SiteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME!,
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION!,
  url: process.env.NEXT_PUBLIC_SITE_URL!,
  phone: process.env.NEXT_PUBLIC_SITE_PHONE!,
  email: process.env.NEXT_PUBLIC_SITE_EMAIL!,
  address: process.env.NEXT_PUBLIC_SITE_ADDRESS!,

  
  //! Données dynamiques de localisation
  rayonIntervention: process.env.NEXT_PUBLIC_RAYON_INTERVENTION!,
  city: process.env.NEXT_PUBLIC_CITY!,

  //! Informations légales
  legal: {
    siret: process.env.NEXT_PUBLIC_SIRET!,
    ownerName: process.env.NEXT_PUBLIC_OWNER_NAME!,
  },

  contact: {
    email: process.env.SMTP_USER!,
    receiver: process.env.CONTACT_RECEIVER!,
  },
  smtp: {
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!) || 465,
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
    from: process.env.SMTP_FROM!,
  },
  calcom: {
    username: process.env.NEXT_PUBLIC_CAL_COM_USERNAME!,
    iframeUrl: process.env.NEXT_PUBLIC_CAL_COM_URL!,
  },

  whatsapp: {
    number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER!,
  },
  //! 🆕 Code parrainage Autodoc
  autodoc: {
    referralCode: process.env.NEXT_PUBLIC_AUTODOC_REF_CODE!,
    referralUrl: process.env.NEXT_PUBLIC_AUTODOC_URL!,
  },
};
