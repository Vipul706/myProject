import { env } from '../config/envconfig';
import { models } from './../collections/index';
import { Logger } from "./logger";
const { blackBox } = models
import type { LogLevel, LogTransport, ParsedError } from "./types";

const createLogger = (): Logger => {
    const logger = new Logger(env.log_level as LogLevel || 'info');
    logger.addTransport(ConsoleTransport);
    return logger;
};
const ConsoleTransport: LogTransport = {
    log(level: LogLevel, message: string, meta: any[]) {
        console.log(message, ...meta);
    }
};
async function errorParser(error: any, methodName: string, level: string): Promise<ParsedError> {
    const err = await blackBox.findOne({ stack: error.stack, method: methodName })
    if (!err) {
        await models.blackBox.create({
            message: error.message,
            method: methodName,
            name: error.name,
            level: level,
            stack: error.stack || 'No stack trace',
        })
    }
    if (error instanceof Error) {
        return {
            name: error.name,
            method: methodName,
            message: error.message,
            stack: error.stack || 'No stack trace',
        };
    }

    return {
        name: 'UnknownError',
        method: methodName,
        message: String(error),
        stack: 'No stack trace',
    };
}

export {
    createLogger,
    errorParser
};