const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const logFormat = winston.format.combine(
                          winston.format.colorize(),
                          winston.format.timestamp(),
                          winston.format.align(),
                          winston.format.printf( info => `${info.timestamp}::${info.message}`,),
                );
const transport = new DailyRotateFile({ 
            filename: "logs/serverss-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
            prepend: true,
            level:"info",
});
transport.on("rotate", function (oldFilename, newFilename) {
});

const logger = winston.createLogger({
        format: logFormat,
        transports: [
                transport,
                new winston.transports.Console({level: "info",}),
        ]
});

module.exports = logger