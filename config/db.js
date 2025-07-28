// db.js
const mongoose = require("mongoose");

let isConnected;

const connectDB = async () => {
    if (isConnected) {
        return;
    }

    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        bufferCommands: false, // explicitly added in your case
    });

    isConnected = true;
};

module.exports = connectDB;
