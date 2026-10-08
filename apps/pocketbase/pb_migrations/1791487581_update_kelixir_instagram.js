/// <reference path="../pb_data/types.d.ts" />

// Fixes K Elixir's Instagram link to her real handle (the seeded placeholder
// "https://instagram.com/kelixir" wasn't her actual profile).
migrate(
  (app) => {
    const record = app.findFirstRecordByFilter("partners", "name = 'K Elixir'");
    record.set("instagram", "https://www.instagram.com/kelixir2025/");
    app.save(record);
  },
  (app) => {
    try {
      const record = app.findFirstRecordByFilter("partners", "name = 'K Elixir'");
      record.set("instagram", "https://instagram.com/kelixir");
      app.save(record);
    } catch (e) {
      // record gone — fine.
    }
  },
);
