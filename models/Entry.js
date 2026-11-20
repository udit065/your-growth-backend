const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema(
    {
        // Local calendar date of the check-in, as YYYY-MM-DD.
        date: { type: String, required: true, unique: true },
        response: { type: String, required: true, trim: true, maxlength: 2000 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Entry', entrySchema);
