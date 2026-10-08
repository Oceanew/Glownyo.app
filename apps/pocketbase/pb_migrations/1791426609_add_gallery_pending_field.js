/// <reference path="../pb_data/types.d.ts" />

// New gallery photos/videos a provider uploads through their self-service
// profile now land here instead of directly in `gallery`, so an admin can
// review each one (guard against inappropriate or AI-generated images)
// before it becomes publicly visible. `/providers/public` only ever reads
// `gallery`, never this field.
migrate(
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    if (!users.fields.getByName("gallery_pending")) {
      users.fields.add(
        new FileField({
          name: "gallery_pending",
          maxSelect: 20,
          maxSize: 15 * 1024 * 1024,
          mimeTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "video/mp4",
            "video/quicktime",
          ],
        }),
      );
    }
    app.save(users);
  },
  (app) => {
    const users = app.findCollectionByNameOrId("users");
    users.fields.removeByName("gallery_pending");
    app.save(users);
  },
);
