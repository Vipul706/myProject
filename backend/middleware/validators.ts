import type { NextFunction, Request, RequestHandler, Response } from "express";
import { createLogger } from "../utils/logger";
import { models } from "../collections";
import { errorParser } from "../utils/utils";
import type { AppError } from "../types/express-error";
const { pulseStream } = models

const logger = createLogger();

const routerSanity = (request: Request, response: Response, next: NextFunction): void => {
    request.validRoute = true;
    next();
};

const apiHeartBeat = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        logger.info(`${request.method} ${(new Date()).toLocaleTimeString()} api request --->  ` + request.headers.host || request.hostname + request.baseUrl)
        fireAndForgetPulse(request);
        next();
    } catch (error) {
        throw (error)
    }
}

function fireAndForgetPulse(request: Request, attempt = 1) {
    if (attempt > 3) {
        return logger.fatal('Pulse Stream error', errorParser('Max retries reached', request.method, 'fatal'));
    }
    pulseStream.create({
        originalUrl: request.headers.host || request.hostname + request.originalUrl,
        url: request.originalUrl,
        host: request.host,
        method: request.method,
    }).catch(err => {
        logger.warn(`Retrying pulse stream write. Attempt ${attempt}`);
        logger.error('Pulse Stream error', errorParser(err, request.method, 'error'));
        // Retry with delay
        setTimeout(() => fireAndForgetPulse(request, attempt + 1), 200 * attempt); // Exponential backoff
    });
}


const globalErrorHandler = async (err: AppError, req: Request, res: Response, next: NextFunction) => {
   const error = await errorParser(err, err.name, err.level);
    logger[error.level](error.message, err);
    res.status(error.code).send(err);
}

export { routerSanity, apiHeartBeat, globalErrorHandler };
