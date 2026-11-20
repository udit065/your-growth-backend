const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const entriesRouter = require('./routes/entries');

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '20kb' }));

// Lightweight endpoint used to wake the server up / keep it warm.
app.get('/health', (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use('/entries', entriesRouter);

app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON body' });
    }
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
});

module.exports = app;
