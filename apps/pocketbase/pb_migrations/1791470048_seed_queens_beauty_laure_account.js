/// <reference path="../pb_data/types.d.ts" />

// Turns the "Queen's Beauty by Laure" hardcoded PROVIDERS entry
// (apps/web/src/data/site.js) into a real, validated PocketBase account, so
// she can log in and edit her own profile (bio, prices, photos, hours)
// going forward — same pattern as 1790898910_seed_historic_provider_accounts.js,
// split into its own migration because her email only became available later.
//
// Photos/video stay on their current static paths (avatar_url/gallery_urls,
// served from the frontend's own /public folder) — no file re-upload needed
// here; a future edit through her self-service profile would populate the
// native avatar/gallery file fields instead, which the frontend prefers over
// these fallbacks once present.
//
// Password comes from an env var (never hardcoded/committed) — same pattern
// as the other provider seeds. Unset var is skipped with a log line rather
// than failing the whole migration.
migrate((app) => {
  const users = app.findCollectionByNameOrId("users");

  const envKey = "PROVIDER_SEED_PASSWORD_QUEENS_BEAUTY_LAURE";
  const password = $os.getenv(envKey);
  if (!password) {
    app.logger().warn(
      "skipping provider seed — env var not set",
      "slug",
      "queens-beauty-by-laure",
      "envKey",
      envKey,
    );
    return;
  }

  const record = new Record(users);
  record.set("email", "laureoussou17@gmail.com");
  record.set("password", password);
  record.set("role", "provider");
  record.set("validated", true);
  record.set("name", "Queen's Beauty by Laure");
  record.set("slug", "queens-beauty-by-laure");
  record.set("specialty", "Coiffure");
  record.set("tagline", "Locks & tresses protectrices");
  record.set("location", "Akpakpa, Cotonou");
  record.set("phone", "0154914777");
  record.set("whatsapp_secondary", "0140136965");
  record.set("instagram", "https://instagram.com/queensbeautybylaure");
  record.set("experience", "1 an d'expérience");
  record.set(
    "availability",
    "Disponibilité à renseigner, à confirmer directement avec la prestataire",
  );
  record.set("starting_price_override", "15 000 FCFA");
  record.set("rating", 5.0);
  record.set("review_count", 9);
  record.set("avatar_shape", "circle");
  record.set(
    "bio",
    "Fondatrice de Queen's Beauty by Laure, Laure sublime les cheveux naturels avec des locks impeccables et des tresses protectrices, avec un an d'expérience passionnée sur le terrain à Akpakpa.",
  );
  record.set("services", [
    { name: "Pose de locks", price: "20 000 FCFA", duration: "3h" },
    { name: "Tresses protectrices", price: "15 000 FCFA", duration: "2h30" },
    { name: "Entretien locks", price: "10 000 FCFA", duration: "1h30" },
  ]);
  record.set("avatar_url", "/images/providers/queens-beauty-by-laure.jpg");
  record.set("gallery_urls", [
    "/images/providers/queens-beauty-by-laure.jpg",
    "/images/providers/queens-beauty-by-laure-2.jpg",
    { type: "video", src: "/videos/providers/queens-beauty-by-laure-1.mp4" },
  ]);

  app.save(record);
}, (app) => {
  try {
    const record = app.findFirstRecordByFilter(
      "users",
      "slug = {:slug}",
      { slug: "queens-beauty-by-laure" },
    );
    app.delete(record);
  } catch (e) {
    // already gone — fine.
  }
});
