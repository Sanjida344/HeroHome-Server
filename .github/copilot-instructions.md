Project: HomeHero-Server — AI coding assistant instructions

Keep guidance short, actionable, and codebase-specific. Use the examples and file references below when making edits.

- Purpose: This is a small Express + MongoDB API deployed on Vercel (`vercel.json`). The main entry is `index.js` and the app is exported (`module.exports = app`) so changes must preserve that export for serverless deployments and tests.

- Run / Build:
  - Install: `npm install`
  - Local start: `npm start` (runs `node index.js`). Note: `index.js` guards the listener with `if (require.main === module)` so `require('./index')` won't start the server.
  - Vercel: `vercel.json` routes all requests to `index.js` using `@vercel/node`.

- Key files to reference:
  - [index.js](index.js): all HTTP routes, DB connection and main server logic.
  - [package.json](package.json): scripts and runtime dependencies.
  - [vercel.json](vercel.json): deployment entry and routing.

- Architecture & data flows (concise):
  - Single-process Express API connects to MongoDB (`homeNest_database`) and exposes two main collections: `properties` and `ratings`.
  - Typical flow: request -> route handler in `index.js` -> collection operation (insert/find/update/delete) -> JSON response.

- Important implementation details agents must preserve or follow:
  - MongoDB: `index.js` creates a `MongoClient` and calls `client.connect()` once in `run()`. Avoid creating multiple global clients or reconnecting per-request.
  - Export: keep `module.exports = app` so the app can be required in tests or serverless environments.
  - Start guard: do not remove `if (require.main === module)` — it intentionally prevents the server from auto-listening when imported.
  - ObjectId usage: route handlers create `new ObjectId(id)` when reading/updating/deleting by id — preserve this pattern.

- Routes & request patterns (copy examples when adding or editing handlers):
  - Create property: `POST /property` or `POST /properties` with JSON body -> inserts into `properties`.
  - Query user properties: `GET /property?email=owner@example.com` -> finds by `owner_email`.
  - Read single property: `GET /property/:id` -> uses `_id: new ObjectId(id)`.
  - Update single property: `PATCH /property/:id` with partial body -> uses `$set` in `updateOne`.
  - Ratings: `POST /ratings`, `GET /ratings?email=reviewer@example.com`, `DELETE /ratings/:id`.

- Conventions & patterns to mirror:
  - Collections named in code: `properties`, `ratings` (DB: `homeNest_database`).
  - Date sorting: queries use `.sort({ postedDate: -1 })` and sometimes `.limit(6)` for latest items — follow this when adding list endpoints.
  - Keep handlers small and synchronous-looking (async/await) — follow the existing `async (req, res) => { ... }` style.

- Environment & secrets (what the code reveals):
  - `dotenv` is required in `index.js`, but the MongoDB URI is currently hard-coded in the file. If you change the connection to use `process.env.MONGODB_URI`, update `.env.example` and deployment env vars accordingly.
  - Be careful not to commit production credentials. If migrating the URI to env, ensure Vercel environment variables are set.

- Dependencies & cleanup notes:
  - `package.json` lists `firebase-admin` but it's not referenced in `index.js`. If adding Firebase features, import and initialize explicitly; otherwise consider removing the unused dependency.

- Testing & debugging hints:
  - The app export enables lightweight unit/integration tests that `require('./index')` and use supertest without starting a real listener.
  - For local debugging, use `node index.js` and inspect console logs; Mongo client logs connect success.

- When editing code, include concrete code examples in PRs and preserve API surface:
  - Example: when adding a new GET endpoint that returns a user's properties, follow existing patterns for query extraction, collection usage, and `.toArray()` conversion.

If anything above is unclear or you want other examples (tests, a `.env.example`, or migrating the URI to env vars), tell me which section to expand. I can iterate on this doc.
