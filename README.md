# 🌱 Your Growth (API)

The REST API for the [Your Growth](https://github.com/udit065/your-growth-frontend) daily check-in app. It stores one entry per day in MongoDB.

## Tech stack
Node.js · Express 5 · MongoDB / Mongoose · deployed on Render

## API
| Method | Route | Purpose |
|---|---|---|
| GET | `/health` | Health check (also used to keep the server warm) |
| GET | `/entries` | List all entries, newest first |
| GET | `/entries/:date` | Get the entry for a date (`YYYY-MM-DD`) |
| POST | `/entries` | Create an entry `{ date, response }` (409 if that day already has one) |
| PUT | `/entries/:date` | Create or update the entry for a date `{ response }` |
| DELETE | `/entries/:date` | Delete the entry for a date |

Dates must be real `YYYY-MM-DD` dates and not in the future. Responses are trimmed, required, and capped at 2000 characters.

## Run locally
```bash
npm install
# create .env with:
#   MONGO_URI=<MongoDB connection string>
#   PORT=5000
npm run dev     # or: npm start
npm test        # runs against an in-memory MongoDB
```

## Keeping it fast
Render's free tier sleeps when idle, so the first request after a while is slow. [`.github/workflows/keep-warm.yml`](.github/workflows/keep-warm.yml) pings `/health` every 10 minutes to keep it awake. The app also caches everything on the phone, so it never waits on the server to show your data.

## Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
