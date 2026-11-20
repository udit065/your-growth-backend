const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ quiet: true });

const app = require('./app');

const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set');
    process.exit(1);
}

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
