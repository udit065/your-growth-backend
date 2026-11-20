// Saves every entry to backups/entries-<timestamp>.json (gitignored).
// Usage: npm run backup
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Entry = require('../models/Entry');

dotenv.config({ quiet: true });

(async () => {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 });
    const entries = await Entry.find().sort({ date: 1 }).lean();
    const dir = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(dir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(dir, `entries-${stamp}.json`);
    fs.writeFileSync(file, JSON.stringify(entries, null, 2));
    console.log(`Backed up ${entries.length} entries to ${file}`);
    await mongoose.disconnect();
})().catch((err) => {
    console.error(err.message);
    process.exit(1);
});
