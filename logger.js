const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const printfFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
        handleExceptions: true,
        json: false,
        maxsize: 1024*1024*10,
        maxFiles: 5,
        colorize: false,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printfFormat
    ),
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false,
});

logger.stream = {
    write: function (message, encoding) {
        logger.info(message);
    },
};

module.exports = logger;