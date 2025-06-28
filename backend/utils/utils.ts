import { models } from './../collections/index';
const { blackBox } = models
import type { ParsedError } from "./types";


async function errorParser(error: any, methodName: string, level: string): Promise<ParsedError> {
    const err = await blackBox.findOne({ stack: error.stack, method: methodName })
    if (!err) {
        await blackBox.create({
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
    errorParser
};