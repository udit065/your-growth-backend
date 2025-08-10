const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// POST /entries
router.post('/', async (req, res) => {
    const { date, response } = req.body;

    try {
        let entry = await Entry.findOne({ date });
        if (entry) {
            return res.status(400).json({ message: 'Already submitted today' });
        }

        entry = new Entry({ date, response });
        await entry.save();
        res.status(201).json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /entries - Get all entries sorted by date (newest first)
router.get('/', async (req, res) => {
    try {
        const entries = await Entry.find().sort({ date: -1 }); // newest first
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching entries' });
    }
});

// GET /entries/:date - Fetches a single entry for a specific date
router.get('/:date', async (req, res) => {
    try {
        const entry = await Entry.findOne({ date: req.params.date });
        if (!entry) return res.status(404).json({ message: 'Not found' });
        res.json(entry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
