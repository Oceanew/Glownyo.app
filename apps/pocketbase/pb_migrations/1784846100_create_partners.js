/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    let collection;
    try {
      collection = app.findCollectionByNameOrId("partners");
    } catch (_) {
      collection = new Collection({
        type: "base",
        name: "partners",
        // Public directory — anyone can read; only server-side/migrations write.
        listRule: "",
        viewRule: "",
        createRule: null,
        updateRule: null,
        deleteRule: null,
        fields: [
          { name: "name", type: "text", required: true, max: 150 },
          { name: "specialty", type: "text", required: true, max: 150 },
          { name: "location", type: "text", max: 150 },
          { name: "description", type: "text", required: true, max: 1000 },
          { name: "logo", type: "text", max: 500 },
          { name: "instagram", type: "url", max: 300 },
          { name: "facebook", type: "url", max: 300 },
          { name: "tiktok", type: "url", max: 300 },
          { name: "whatsapp", type: "url", max: 300 },
          { name: "website", type: "url", max: 300 },
          { name: "order", type: "number" },
          { name: "created", type: "autodate", onCreate: true, onUpdate: false },
          { name: "updated", type: "autodate", onCreate: true, onUpdate: true },
        ],
        indexes: ["CREATE INDEX idx_partners_order ON partners (`order`)"],
      });
      app.save(collection);
    }

    try {
      const existing = app.findFirstRecordByFilter("partners", "name = 'K Elixir'");
      if (existing) return;
    } catch (_) {
      // not found, proceed to seed
    }

    const record = new Record(collection);
    record.load({
      name: "K Elixir",
      specialty: "Soins capillaires",
      location: "Cotonou, Bénin",
      description:
        "K Elixir crée des soins capillaires naturels haut de gamme pensés pour nourrir, fortifier et sublimer les cheveux afro et métissés au quotidien.",
      logo: "https://images.hostinger.com/dfdf7e17-7c4d-4a89-a5b8-a40cdd9d451b.png",
      instagram: "https://instagram.com/kelixir",
      whatsapp: "https://wa.me/22900000000",
      order: 1,
    });
    app.save(record);
  },
  (app) => {
    try {
      const collection = app.findCollectionByNameOrId("partners");
      app.delete(collection);
    } catch (e) {
      if (e.message && e.message.includes("no rows in result set")) {
        return;
      }
      throw e;
    }
  },
);
