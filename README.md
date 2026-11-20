# 🌱 Your Growth (API)

The REST API for the [Your Growth](https://github.com/udit065/your-growth-frontend) daily check-in app. It stores one entry per day in MongoDB Atlas and is deployed on Render.

**Live:** https://your-growth-backend.onrender.com/health

## Tech stack
Node.js · Express 5 · MongoDB Atlas / Mongoose · Render · GitHub Actions

## API
| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Health check: `{ ok, db }` (also used to keep the server warm) |
| GET | `/entries` | List all entries, newest first |
| GET | `/entries/:date` | Get the entry for a date (`YYYY-MM-DD`) |
| POST | `/entries` | Create an entry `{ date, response }` (409 if that day already has one) |
| PUT | `/entries/:date` | Create or update the entry for a date `{ response }` |
| DELETE | `/entries/:date` | Delete the entry for a date |

An entry looks like:
```json
{ "date": "2025-08-15", "response": "Had a good independence day", "createdAt": "…", "updatedAt": "…" }
```

**Rules:** `date` is the phone's local calendar day as `YYYY-MM-DD`, must be a real date and can't be in the future. `response` is required, trimmed, and at most 2000 characters.

## Run locally
```bash
npm install
# create .env with:
#   MONGO_URI=<MongoDB Atlas connection string>
#   PORT=5000
npm run dev       # start with auto-reload
npm start         # start normally
npm test          # tests run against an in-memory MongoDB (no Atlas needed)
npm run backup    # save all entries to backups/ (gitignored)
```

## Project layout
```
server.js           Connects to MongoDB, then starts the server
app.js              Express app: middleware, /health, error handling
routes/entries.js   /entries routes and validation
models/Entry.js     Mongoose schema
scripts/backup.js   Backup all entries to a JSON file
test/               API tests
```

## Deployment (Render)
- Render builds with `npm install` and starts with `npm start`.
- `MONGO_URI` is set in Render → Environment. In Atlas → Network Access, `0.0.0.0/0` must be allowed because Render has no fixed IP.
- **Auto-deploy:** every push to `main` is deployed automatically, as long as Render → Settings → Build & Deploy → *Auto-Deploy* is set to **On Commit**. Otherwise use *Manual Deploy → Deploy latest commit*.
- If MongoDB can't be reached, the server exits on startup, so a broken deploy shows as failed in Render instead of hanging.

## Keeping it fast and awake
- **Render free tier** sleeps after ~15 min idle, so the first request after that takes 30–60 s. [`.github/workflows/keep-warm.yml`](.github/workflows/keep-warm.yml) pings `/health` every 10 minutes to keep it awake. GitHub pauses scheduled workflows after 60 days with no repo activity; re-enable it in the Actions tab if that happens.
- **Atlas free tier** pauses a cluster after a long time with no connections. When paused, its hostname stops resolving and the API can't start. Resume it from the Atlas dashboard (`•••` → Resume). The keep-warm ping also keeps the database in use.
- The app caches everything on the phone, so it never waits on the server to show your data.

## Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
