/// <reference path="../pb_data/types.d.ts" />

// Structured weekly schedule a provider sets from her own profile, used to
// actually constrain what date/time a client can request on the booking
// form — unlike the free-text `availability` field (kept as-is), which is
// only ever displayed, never enforced.
//
// Shape: an array of up to 7 entries, one per day:
//   { day: "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun", enabled: bool,
//     start: "HH:MM", end: "HH:MM" }
// Null/empty means "no restriction" (today's behaviour, unchanged) — so
// existing providers who haven't filled it in yet are not affected.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("availability_schedule")) {
      users.fields.add(new JSONField({ name: "availability_schedule", maxSize: 4000 }));
    }
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("availability_schedule");
    app.save(users);
  },
);
