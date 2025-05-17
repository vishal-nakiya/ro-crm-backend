require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverApi: '1', // Optional: enables MongoDB v5+ compatibility mode
            tls: true // Enforce secure TLS connection (especially needed on Windows sometimes)
        });
        console.log('✅ MongoDB Atlas connected successfully11!');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
};

module.exports = connectDB;
