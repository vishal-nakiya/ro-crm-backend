const express = require('express');
const dotenv = require('dotenv');
const app = express();
const connectDB = require('../config/db');
const Routes = require('../Routes/index');
const logger = require("../logger/index");
const moment = require("moment");
dotenv.config();
connectDB(); // <== Connect to MongoDB


app.use(express.json());
app.use((error, req, res, next) => {
    res.status(500).send("Could not perform the action");
});
app.use(async (req, res, next) => {
    const logNumber = moment().format("YYYYMMDDhhmmss");
    req.headers.lognumber = logNumber;
    reqoriginalUrl = req.originalUrl;

    let LogText = `Case - ${logNumber} - ${req.method} - ${req.originalUrl} ==> ${JSON.stringify(req.body)}`;
    if (req.method != "OPTIONS") {
        console.log(LogText);
    }
    logger.info(LogText);
    next();
});
// ... all your route uses and middleware
app.use('/', Routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
