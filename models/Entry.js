const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    response: { type: String, required: true },
});

module.exports = mongoose.model('Entry', entrySchema);
