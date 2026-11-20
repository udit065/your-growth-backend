const express = require('express');
const Entry = require('../models/Entry');

const router = express.Router();

const MAX_RESPONSE_LENGTH = 2000;
const FIELDS = 'date response createdAt updatedAt';

// A real calendar date in YYYY-MM-DD form.
function isValidDate(date) {
    if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
    const d = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === date;
}

// The phone sends its local date. The earliest timezone is UTC+14, so no
// real "today" can be later than that.
function isInFuture(date) {
    const latestToday = new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString().slice(0, 10);
    return date > latestToday;
}

function validateDate(date) {
    if (!isValidDate(date)) return 'Date must be a valid YYYY-MM-DD date';
    if (isInFuture(date)) return 'Date cannot be in the future';
    return null;
}

function validateResponse(response) {
    if (typeof response !== 'string' || response.trim() === '') return 'Response is required';
    if (response.trim().length > MAX_RESPONSE_LENGTH) {
        return `Response must be at most ${MAX_RESPONSE_LENGTH} characters`;
    }
    return null;
}

// GET /entries - all entries, newest first
router.get('/', async (req, res, next) => {
    try {
        const entries = await Entry.find().select(FIELDS).sort({ date: -1 }).lean();
        res.json(entries);
    } catch (err) {
        next(err);
    }
});

// GET /entries/:date
router.get('/:date', async (req, res, next) => {
    try {
        const error = validateDate(req.params.date);
        if (error) return res.status(400).json({ message: error });
        const entry = await Entry.findOne({ date: req.params.date }).select(FIELDS).lean();
        if (!entry) return res.status(404).json({ message: 'Not found' });
        res.json(entry);
    } catch (err) {
        next(err);
    }
});

// POST /entries - create a new entry (fails if that date already has one)
router.post('/', async (req, res, next) => {
    try {
        const { date, response } = req.body || {};
        const error = validateDate(date) || validateResponse(response);
        if (error) return res.status(400).json({ message: error });

        const entry = await Entry.create({ date, response: response.trim() });
        res.status(201).json(entry);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'Already submitted for this day' });
        }
        next(err);
    }
});

// PUT /entries/:date - create or update the entry for a date
router.put('/:date', async (req, res, next) => {
    try {
        const { date } = req.params;
        const { response } = req.body || {};
        const error = validateDate(date) || validateResponse(response);
        if (error) return res.status(400).json({ message: error });

        const entry = await Entry.findOneAndUpdate(
            { date },
            { $set: { response: response.trim() } },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )
            .select(FIELDS)
            .lean();
        res.json(entry);
    } catch (err) {
        next(err);
    }
});

// DELETE /entries/:date - idempotent
router.delete('/:date', async (req, res, next) => {
    try {
        const error = validateDate(req.params.date);
        if (error) return res.status(400).json({ message: error });
        await Entry.deleteOne({ date: req.params.date });
        res.status(204).end();
    } catch (err) {
        next(err);
    }
});

module.exports = router;
