const winston = require('winston');
require('winston-daily-rotate-file');

const transports = [];

// Console logger for all environments
transports.push(new winston.transports.Console());

if (process.env.VERCEL !== '1') {
        // Only add file logger if NOT running on Vercel
        const DailyRotateFile = require('winston-daily-rotate-file');
        transports.push(
                new DailyRotateFile({
                        filename: 'logs/app-%DATE%.log',
                        datePattern: 'YYYY-MM-DD',
                        zippedArchive: false,
                        maxSize: '20m',
                        maxFiles: '14d',
                })
        );
}

const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(
                        ({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`
                )
        ),
        transports
});

module.exports = logger;
