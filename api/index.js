const express = require('express');
const serverless = require('serverless-http'); // ✅ wrap for Vercel
const dotenv = require('dotenv');
const connectDB = require('../config/db');
const Routes = require('../Routes/index');
const logger = require('../logger/index');
const moment = require('moment');
const cookieParser = require("cookie-parser");

dotenv.config();

const app = express();
app.use(cookieParser());

// Connect to MongoDB on cold start
connectDB().catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
});

app.use(express.json());

app.use((error, req, res, next) => {
    res.status(500).send("Could not perform the action");
});

app.use(async (req, res, next) => {
    const logNumber = moment().format("YYYYMMDDHHmmss");
    req.headers.lognumber = logNumber;

    const logText = `Case - ${logNumber} - ${req.method} - ${req.originalUrl} ==> ${JSON.stringify(req.body)}`;
    if (req.method !== "OPTIONS") {
        console.log(logText);
    }
    logger.info(logText);
    next();
});

app.use('/', Routes);

// ✅ Export the handler for Vercel
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

