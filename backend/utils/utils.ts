import { Logger } from "./logger";
import type { LogLevel, LogTransport, ParsedError } from "./types";

const createLogger = (): Logger => {
    const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');
    logger.addTransport(ConsoleTransport);
    return logger;
};
 const ConsoleTransport: LogTransport = {
    log(level: LogLevel, message: string, meta: any[]) {
        console.log(message, ...meta);
    }
};
function errorParser(error: unknown): ParsedError {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack || 'No stack trace',
        };
    }

    return {
        name: 'UnknownError',
        message: String(error),
        stack: 'No stack trace',
    };
}

export {
    createLogger,
    errorParser
};