export const LOGO = "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/e79e99a8bd8831363c8c3743ed088f34.png";

export const WHATSAPP_NUMBER = "33743626818"; // WhatsApp Business — équipe GlowNyo (+33 7 43 62 68 18)
export const TEAM_WHATSAPP = "33743626818"; // Contact équipe GlowNyo pour prestataires & partenaires
export const EMAIL = "glownyoapp@gmail.com";
export const TEAM_EMAIL = "glownyoapp@gmail.com";
export const CALENDLY_URL = "https://calendly.com/glownyoapp/30min";

export const waLink = (message) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message || "Bonjour, j'ai une question concernant une réservation Glownyo.")}`;

// Lien WhatsApp direct vers l'équipe GlowNyo (+33 7 43 62 68 18) avec message prérempli.
export const teamWaLink = (message) =>
  `https://wa.me/${TEAM_WHATSAPP}?text=${encodeURIComponent(message || "Bonjour, j'ai une question concernant une réservation Glownyo.")}`;

// Build a WhatsApp link directly to a specific provider's own number.
// `phone` is the local Beninese number (with or without leading 0); we
// normalize it and prefix the +229 country code.
export const waLinkTo = (phone, message) => {
  const digits = String(phone || "").replace(/\D/g, "").replace(/^0/, "");
  return `https://wa.me/229${digits}?text=${encodeURIComponent(message || "Bonjour, je vous ai trouvée sur GlowNyo et souhaite en savoir plus.")}`;
};

export const SPECIALTIES = [
  "Coiffure",
  "Manucure / Pédicure",
  "Henné",
  "Esthétique",
  "Barbier",
  "Bien-être",
];

export const PROVIDERS = [
  {
    slug: "queens-beauty-by-laure",
    name: "Queen's Beauty by Laure",
    businessName: "Queen's Beauty by Laure",
    specialty: "Coiffure",
    tagline: "Locks & tresses protectrices",
    location: "Akpakpa, Cotonou",
    whatsapp: "0154914777",
    whatsappSecondary: "0140136965",
    instagram: "https://instagram.com/queensbeautybylaure",
    experience: "1 an d'expérience",
    availability: "Disponibilité à renseigner, à confirmer directement avec la prestataire",
    startingPrice: "15 000 FCFA",
    rating: 5.0,
    reviews: 9,
    image: "https://images.hostinger.com/4ae8998b-75e0-40a2-afcf-c7be223bd128.png",
    bio: "Fondatrice de Queen's Beauty by Laure, Laure sublime les cheveux naturels avec des locks impeccables et des tresses protectrices, avec un an d'expérience passionnée sur le terrain à Akpakpa.",
    services: [
      { name: "Pose de locks", price: "20 000 FCFA", duration: "3h" },
      { name: "Tresses protectrices", price: "15 000 FCFA", duration: "2h30" },
      { name: "Entretien locks", price: "10 000 FCFA", duration: "1h30" },
    ],
    gallery: [
      "https://images.hostinger.com/4ae8998b-75e0-40a2-afcf-c7be223bd128.png",
    ],
  },
  {
    slug: "tcheckna-henne",
    name: "TCHECKNA Henné",
    businessName: "tcheckna_henne",
    specialty: "Henné",
    tagline: "Henné moderne, sourcils et cils",
    location: "Agla Akplomey, Cotonou",
    whatsapp: "152005730",
    instagram: "https://instagram.com/tcheckna_henne",
    experience: "Depuis 2020",
    availability: "RDV pris la veille : Lun-Ven à partir de 19h, Sam dès 16h, Dim toute la journée",
    startingPrice: "8 000 FCFA",
    rating: 5.0,
    reviews: 14,
    image: "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/90a41505293a554cbbe38ebbc06b8207.jpg",
    bio: "Depuis 2020, TCHECKNA Henné met son savoir-faire au service de votre beauté avec des prestations modernes et soignées. Spécialisée dans le tatouage au henné moderne, elle propose également le traçage des sourcils et la pose de cils. Grâce à son appareil de séchage express, votre tatouage au henné sèche plus rapidement pour vous permettre de profiter pleinement de votre motif. Bientôt, TCHECKNA Henné proposera également une solution innovante permettant d'imprimer les motifs de henné et de les appliquer avec précision, pour une prestation réalisée en seulement 30 minutes.",
    services: [
      { name: "Tatouage au henné moderne", price: "8 000 FCFA", duration: "1h" },
      { name: "Traçage des sourcils", price: "8 000 FCFA", duration: "1h" },
      { name: "Pose de cils", price: "35 000 FCFA", duration: "3h" },
    ],
    gallery: [
      "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/df9db67837444efcb9a1a9324eaf3a39.jpg",
      "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/288801f51626dab64eb0554e603bc36a.jpg",
      "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/2227f002a04d196ddfdfcead73598160.jpg",
      "https://horizons-cdn.hostinger.com/1abd766d-e423-438d-8143-d72cc1e75115/28b0b4ae3fde811ac17c49de3d3ee74a.jpg",
    ],
  },
  {
    slug: "yabi-nora",
    name: "kittysfairy_vibezzz",
    businessName: "kittysfairy_vibezzz",
    specialty: "Coiffure",
    tagline: "Locks, tresses, ongles & cils",
    location: "Godomey (Hors Cotonou)",
    whatsapp: "164471168",
    email: "norayabi@gmail.com",
    instagram: "https://instagram.com/kittysfairy_vibezzz",
    experience: "Expérience non renseignée",
    availability: "Tous les jours sauf le jeudi (semaine 18h-21h, week-end 13h-22h30)",
    startingPrice: "10 000 FCFA",
    rating: 5.0,
    reviews: 11,
    image: "https://images.hostinger.com/80b91353-8d4c-40bb-8dcb-03c8e3bf2c52.png",
    bio: "Nora propose un service complet : locks, tresses, pose d'ongles et extensions de cils, pour un look afro glamour de la tête aux pieds, à Godomey.",
    services: [
      { name: "Tresses / Locks", price: "18 000 FCFA", duration: "3h" },
      { name: "Pose d'ongles", price: "10 000 FCFA", duration: "1h" },
      { name: "Extension de cils", price: "12 000 FCFA", duration: "1h" },
    ],
    gallery: [
      "https://images.hostinger.com/80b91353-8d4c-40bb-8dcb-03c8e3bf2c52.png",
    ],
  },
  {
    slug: "beahenou-merveille",
    name: "Merveille Beahenou",
    businessName: "Coiffeuse / Coiffeur",
    specialty: "Coiffure",
    tagline: "Coiffure, tresses, ongles & pose de perruque",
    location: "Fidjrossè, Cotonou",
    whatsapp: "193349615",
    email: "beamerveille40@gmail.com",
    instagram: null,
    experience: "Expérience non renseignée",
    availability: "Tous les jours de 10h à 20h",
    startingPrice: "8 000 FCFA",
    rating: null,
    reviews: 0,
    image: "https://images.hostinger.com/7974d3a5-8471-4e4f-a22e-c9cbf1bde1e6.png",
    bio: "Merveille propose un accompagnement beauté complet : coiffure, tresses, pose d'ongles et pose de perruques/wigs, disponible tous les jours à Fidjrossè.",
    services: [
      { name: "Coiffure & tresses", price: "12 000 FCFA", duration: "2h" },
      { name: "Pose de perruque / wig", price: "10 000 FCFA", duration: "1h" },
      { name: "Pose d'ongles", price: "8 000 FCFA", duration: "1h" },
    ],
    gallery: [
      "https://images.hostinger.com/7974d3a5-8471-4e4f-a22e-c9cbf1bde1e6.png",
    ],
  },
  {
    slug: "marthe-kpogba",
    name: "Marthe_Beauty",
    businessName: "Marthe_Beauty",
    specialty: "Esthétique",
    tagline: "Soins du visage, massage & épilation",
    location: "Fidjrossè, Cotonou",
    whatsapp: "196950012",
    email: "marthekpg@icloud.com",
    instagram: "https://instagram.com/Marthe_Beauty",
    experience: "2 ans d'expérience",
    availability: "Disponible le dimanche",
    startingPrice: "6 000 FCFA",
    rating: null,
    reviews: 0,
    image: "https://images.hostinger.com/eef5ce3a-920c-48c3-9c40-c568c2e2e9ba.png",
    bio: "Esthéticienne avec 2 ans d'expérience, Marthe propose des soins du visage, des massages relaxants et des prestations d'épilation à Fidjrossè, disponible le dimanche.",
    services: [
      { name: "Soin du visage", price: "15 000 FCFA", duration: "1h" },
      { name: "Massage relaxant", price: "18 000 FCFA", duration: "1h" },
      { name: "Épilation", price: "6 000 FCFA", duration: "30min" },
    ],
    gallery: [
      "https://images.hostinger.com/eef5ce3a-920c-48c3-9c40-c568c2e2e9ba.png",
    ],
  },
  {
    slug: "houssou-astride",
    name: "Astride Houssou",
    businessName: "Coiffeuse / Coiffeur",
    specialty: "Coiffure",
    tagline: "Tresses & locks sur-mesure",
    location: "Godomey Fignonhou, Cotonou",
    whatsapp: "57164041",
    email: "astridehoussou@icloud.com",
    instagram: null,
    experience: "1 an d'expérience",
    availability: "Lundi à samedi, en matinée",
    startingPrice: "12 000 FCFA",
    rating: null,
    reviews: 0,
    image: "https://images.hostinger.com/c21ece01-0691-4137-8a62-06846f3bf895.png",
    bio: "Avec un an d'expérience, Astride réalise tresses et locks avec précision, disponible du lundi au vendredi ainsi que le samedi matin à Godomey Fignonhou.",
    services: [
      { name: "Tresses", price: "12 000 FCFA", duration: "2h30" },
      { name: "Locks", price: "18 000 FCFA", duration: "3h" },
    ],
    gallery: [
      "https://images.hostinger.com/c21ece01-0691-4137-8a62-06846f3bf895.png",
    ],
  },
];

export const PARTNERS = [
  {
    slug: "afroluxe-cosmetiques",
    name: "Afroluxe Cosmétiques",
    specialty: "Coiffure & soins capillaires",
    location: "Dakar, Sénégal",
    logo: "https://images.hostinger.com/bc3fb654-b592-49e8-8678-3612b979634f.png",
    description:
      "Gamme de soins capillaires naturels formulés pour sublimer et fortifier les cheveux afro et métissés.",
    socials: {
      instagram: "https://instagram.com/afroluxe.cosmetiques",
      facebook: "https://facebook.com/afroluxecosmetiques",
      tiktok: "https://tiktok.com/@afroluxe.cosmetiques",
      whatsapp: waLink("Bonjour Afroluxe Cosmétiques, je vous découvre via GlowNyo."),
      website: "https://afroluxe-cosmetiques.com",
    },
  },
  {
    slug: "ebene-skincare",
    name: "Ébène Skincare",
    specialty: "Esthétique & soins de la peau",
    location: "Abidjan, Côte d'Ivoire",
    logo: "https://images.hostinger.com/6b67fce8-2562-4f72-804b-76221e26f730.png",
    description:
      "Cosmétiques botaniques pensés pour révéler l'éclat naturel des peaux noires, sans compromis sur la qualité.",
    socials: {
      instagram: "https://instagram.com/ebene.skincare",
      facebook: "https://facebook.com/ebeneskincare",
      website: "https://ebene-skincare.com",
    },
  },
  {
    slug: "diamant-nails",
    name: "Diamant Nails",
    specialty: "Manucure / Pédicure",
    location: "Lagos, Nigeria",
    logo: "https://images.hostinger.com/b506d3d5-4362-4855-808a-ad0e7f3eb194.png",
    description:
      "Studio de nail art audacieux, spécialiste des créations sur-mesure et des finitions haute couture.",
    socials: {
      instagram: "https://instagram.com/diamant.nails",
      tiktok: "https://tiktok.com/@diamant.nails",
      whatsapp: waLink("Bonjour Diamant Nails, je vous découvre via GlowNyo."),
    },
  },
  {
    slug: "roi-lion-barbershop",
    name: "Roi Lion Barbershop",
    specialty: "Barbershop & grooming",
    location: "Accra, Ghana",
    logo: "https://images.hostinger.com/7e49bd4a-d472-4572-ba1b-a1243503ded2.png",
    description:
      "Barbershop nouvelle génération alliant coupes précises, rituels de rasage et ambiance conviviale.",
    socials: {
      instagram: "https://instagram.com/roilion.barbershop",
      facebook: "https://facebook.com/roilionbarbershop",
      whatsapp: waLink("Bonjour Roi Lion Barbershop, je vous découvre via GlowNyo."),
    },
  },
  {
    slug: "baobab-spa",
    name: "Baobab Spa & Bien-être",
    specialty: "Bien-être & relaxation",
    location: "Cotonou, Bénin",
    logo: "https://images.hostinger.com/e302611a-c62f-4ac6-ac68-588e8033cc2b.png",
    description:
      "Espace de rituels bien-être inspirés des traditions africaines, pour reconnecter le corps et l'esprit.",
    socials: {
      instagram: "https://instagram.com/baobab.spa",
      facebook: "https://facebook.com/baobabspa",
      website: "https://baobab-spa.com",
    },
  },
  {
    slug: "wax-glow-lifestyle",
    name: "Wax & Glow Lifestyle",
    specialty: "Lifestyle & mode",
    location: "Cotonou, Bénin",
    logo: "https://images.hostinger.com/fce5ac8a-adcf-4063-8608-881641935ddf.png",
    description:
      "Marque lifestyle qui célèbre l'élégance afro à travers accessoires, wax et pièces de créateurs.",
    socials: {
      instagram: "https://instagram.com/wax.glow.lifestyle",
      tiktok: "https://tiktok.com/@waxglow.lifestyle",
      website: "https://waxglow-lifestyle.com",
    },
  },
];

export const IMAGES = {
  heroPortrait: "https://images.hostinger.com/f0b21b20-700b-4420-9f39-92134a1c6db5.png",
  salon: "https://images.hostinger.com/98253609-69d6-47e4-956a-7c5b4487c992.png",
  founders: "https://images.hostinger.com/a7125d6a-ce94-41a5-b095-dd66744f9190.png",
};
