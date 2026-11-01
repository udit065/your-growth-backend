# 🌱 Your Growth (API)

The REST API for the [Your Growth](https://github.com/udit065/your-growth-frontend) daily check-in app. It stores one entry per day in MongoDB.

## Tech stack
Node.js · Express · MongoDB / Mongoose · CORS · dotenv · deployed on Render

## API
| Method | Route | Purpose |
|---|---|---|
| POST | `/entries` | Save today's entry |
| GET | `/entries` | List all entries |
| GET | `/entries/:date` | Get the entry for a date (`YYYY-MM-DD`) |

## Run locally
```bash
npm install
# create .env with:
#   MONGO_URI=<MongoDB connection string>
#   PORT=5000
node server.js
```

## Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
