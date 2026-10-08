/// <reference path="../pb_data/types.d.ts" />

// Safety net: 1790898910_seed_historic_provider_accounts.js ran on the
// PocketBase Cloud instance before the PROVIDER_SEED_PASSWORD_* env vars
// were correctly set there, so it silently skipped all 4 accounts (by
// design — see that file) and, being a one-shot migration, will never
// re-run now that the vars are fixed. This migration is idempotent (checks
// each slug before creating) and only fills in whichever of the 4 are
// still missing.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  const providers = [
    {
      envKey: "PROVIDER_SEED_PASSWORD_YABI_NORA",
      slug: "yabi-nora",
      email: "norayabi@gmail.com",
      name: "kittysfairy_vibezzz",
      specialty: "Coiffure",
      tagline: "Locks, tresses, ongles & cils",
      location: "Godomey (Hors Cotonou)",
      phone: "164471168",
      instagram: "https://instagram.com/kittysfairy_vibezzz",
      experience: "Expérience non renseignée",
      availability: "Tous les jours sauf le jeudi (semaine 18h-21h, week-end 13h-22h30)",
      starting_price_override: "10 000 FCFA",
      rating: 5.0,
      review_count: 11,
      bio: "Nora propose un service complet : locks, tresses, pose d'ongles et extensions de cils, pour un look afro glamour de la tête aux pieds, à Godomey.",
      services: [
        { name: "Tresses / Locks", price: "18 000 FCFA", duration: "3h" },
        { name: "Pose d'ongles", price: "10 000 FCFA", duration: "1h" },
        { name: "Extension de cils", price: "12 000 FCFA", duration: "1h" },
      ],
      avatar_url: "https://images.hostinger.com/80b91353-8d4c-40bb-8dcb-03c8e3bf2c52.png",
      gallery_urls: ["https://images.hostinger.com/80b91353-8d4c-40bb-8dcb-03c8e3bf2c52.png"],
    },
    {
      envKey: "PROVIDER_SEED_PASSWORD_BEAHENOU_MERVEILLE",
      slug: "beahenou-merveille",
      email: "beamerveille40@gmail.com",
      name: "Merveille Beahenou",
      specialty: "Coiffure",
      tagline: "Coiffure, tresses, ongles & pose de perruque",
      location: "Fidjrossè, Cotonou",
      phone: "193349615",
      instagram: "",
      experience: "Expérience non renseignée",
      availability: "Tous les jours de 10h à 20h",
      starting_price_override: "8 000 FCFA",
      rating: 0,
      review_count: 0,
      bio: "Merveille propose un accompagnement beauté complet : coiffure, tresses, pose d'ongles et pose de perruques/wigs, disponible tous les jours à Fidjrossè.",
      services: [
        { name: "Coiffure & tresses", price: "12 000 FCFA", duration: "2h" },
        { name: "Pose de perruque / wig", price: "10 000 FCFA", duration: "1h" },
        { name: "Pose d'ongles", price: "8 000 FCFA", duration: "1h" },
      ],
      avatar_url: "https://images.hostinger.com/7974d3a5-8471-4e4f-a22e-c9cbf1bde1e6.png",
      gallery_urls: ["https://images.hostinger.com/7974d3a5-8471-4e4f-a22e-c9cbf1bde1e6.png"],
    },
    {
      envKey: "PROVIDER_SEED_PASSWORD_MARTHE_KPOGBA",
      slug: "marthe-kpogba",
      email: "marthekpg@icloud.com",
      name: "Marthe_Beauty",
      specialty: "Esthétique",
      tagline: "Soins du visage, massage & épilation",
      location: "Fidjrossè, Cotonou",
      phone: "196950012",
      instagram: "https://instagram.com/Marthe_Beauty",
      experience: "2 ans d'expérience",
      availability: "Disponible le dimanche",
      starting_price_override: "6 000 FCFA",
      rating: 0,
      review_count: 0,
      bio: "Esthéticienne avec 2 ans d'expérience, Marthe propose des soins du visage, des massages relaxants et des prestations d'épilation à Fidjrossè, disponible le dimanche.",
      services: [
        { name: "Soin du visage", price: "15 000 FCFA", duration: "1h" },
        { name: "Massage relaxant", price: "18 000 FCFA", duration: "1h" },
        { name: "Épilation", price: "6 000 FCFA", duration: "30min" },
      ],
      avatar_url: "https://images.hostinger.com/eef5ce3a-920c-48c3-9c40-c568c2e2e9ba.png",
      gallery_urls: ["https://images.hostinger.com/eef5ce3a-920c-48c3-9c40-c568c2e2e9ba.png"],
    },
    {
      envKey: "PROVIDER_SEED_PASSWORD_HOUSSOU_ASTRIDE",
      slug: "houssou-astride",
      email: "astridehoussou@icloud.com",
      name: "Astride Houssou",
      specialty: "Coiffure",
      tagline: "Tresses & locks sur-mesure",
      location: "Godomey Fignonhou, Cotonou",
      phone: "57164041",
      instagram: "",
      experience: "1 an d'expérience",
      availability: "Lundi à samedi, en matinée",
      starting_price_override: "12 000 FCFA",
      rating: 0,
      review_count: 0,
      bio: "Avec un an d'expérience, Astride réalise tresses et locks avec précision, disponible du lundi au vendredi ainsi que le samedi matin à Godomey Fignonhou.",
      services: [
        { name: "Tresses", price: "12 000 FCFA", duration: "2h30" },
        { name: "Locks", price: "18 000 FCFA", duration: "3h" },
      ],
      avatar_url: "https://images.hostinger.com/c21ece01-0691-4137-8a62-06846f3bf895.png",
      gallery_urls: ["https://images.hostinger.com/c21ece01-0691-4137-8a62-06846f3bf895.png"],
    },
  ];

  for (const p of providers) {
    let existing = null;
    try {
      existing = app.findFirstRecordByFilter("users", "slug = {:slug}", { slug: p.slug });
    } catch (_) {
      existing = null;
    }
    if (existing) continue;

    const password = $os.getenv(p.envKey);
    if (!password) {
      app.logger().warn(
        "skipping provider seed — env var not set",
        "slug",
        p.slug,
        "envKey",
        p.envKey,
      );
      continue;
    }

    const record = new Record(users);
    record.set("email", p.email);
    record.set("password", password);
    record.set("role", "provider");
    record.set("validated", true);
    record.set("name", p.name);
    record.set("slug", p.slug);
    record.set("specialty", p.specialty);
    record.set("tagline", p.tagline);
    record.set("location", p.location);
    record.set("phone", p.phone);
    record.set("instagram", p.instagram);
    record.set("experience", p.experience);
    record.set("availability", p.availability);
    record.set("starting_price_override", p.starting_price_override);
    record.set("rating", p.rating);
    record.set("review_count", p.review_count);
    record.set("bio", p.bio);
    record.set("services", p.services);
    record.set("avatar_url", p.avatar_url);
    record.set("gallery_urls", p.gallery_urls);

    app.save(record);
  }
}, (app) => {
  const slugs = ["yabi-nora", "beahenou-merveille", "marthe-kpogba", "houssou-astride"];
  for (const slug of slugs) {
    try {
      const record = app.findFirstRecordByFilter("users", "slug = {:slug}", { slug });
      app.delete(record);
    } catch (e) {
      // already gone — fine.
    }
  }
});
