// db.js
const mongoose = require("mongoose");

let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    // If connection is in progress, wait for it
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: true, // Changed to true to allow buffering
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    try {
        await connectionPromise;
        isConnected = true;
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        isConnected = false;
        connectionPromise = null;
        console.error('❌ MongoDB connection failed:', error.message);
        throw error;
    }

    return connectionPromise;
};

// Handle connection events
mongoose.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
    isConnected = true;
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
    isConnected = false;
    connectionPromise = null;
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
    isConnected = false;
    connectionPromise = null;
});

module.exports = connectDB;
