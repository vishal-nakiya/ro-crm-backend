// config/db.js
const mongoose = require('mongoose');
let isConnected = false;

mongoose.set('bufferCommands', false); // 👈 Disable buffering to avoid silent timeouts

const connectDB = async () => {
    if (isConnected) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true;
        console.log('✅ MongoDB Atlas connected successfully!');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw error;
    }
};

// Optional: Global error logging
mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});

module.exports = connectDB;
