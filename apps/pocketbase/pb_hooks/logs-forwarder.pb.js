
/// <reference path="../pb_data/types.d.ts" />

// Routes every _logs row to stdout/stderr on production instead of the
// database, so logs land in whatever log collector the host provides. In
// any other environment, logs keep writing to the database as usual.
onModelCreate((e) => {
    const env = $os.getenv("NODE_ENV")

    if (env !== "production") {
        e.next()
        return
    }

    const write = e.model.level >= 8 ? console.error : console.log

    try {
        write(JSON.stringify({
            id: e.model.id,
            created: e.model.created.string(),
            level: e.model.level,
            message: e.model.message,
            data: JSON.parse(e.model.data.string()),
        }))
    } catch (err) {
        console.error(`Failed to forward log: ${err}`)

        write(JSON.stringify({ level: e.model.level, message: e.model.message }))
    }

    // do not continue writing to the database
}, "_logs")
